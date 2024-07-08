import strapi from "@strapi/strapi";

import { Alchemy, Network } from "alchemy-sdk";
import Web3 from "web3";
import { ExactNumber as N } from "exactnumber";

import {
  TRANSFER_TOKEN_EVENT_HASH,
  TRANSFER_TOKEN_EVENT_ABI,
  TRANSFER_VALUE_EVENT_HASH,
  TRANSFER_VALUE_EVENT_ABI,
  SLOT_CHANGED_EVENT_HASH,
  SLOT_CHANGED_EVENT_ABI,
  CLAIM_EVENT_HASH,
  CLAIM_EVENT_ABI,
} from "../src/tasks/fetch-event-log/abi";

const syncEventLog = async () => {
  const appContext = await strapi.compile();
  const app = await strapi(appContext).load();

  /* Init Provider */
  const alchemy = new Alchemy({
    apiKey: process.env.ALCHEMY_ETHEREUM_SEPOLIA_KEY,
    network: Network.ETH_SEPOLIA,
  });
  const web3 = new Web3(Web3.givenProvider);

  /* Sync Event Log */
  let latestTokenEventLogBlockNumber = 0;
  let latestTokenEventLogIndex = 0;

  /* Step 01 - Check Fund exists */
  const fundEntities = await app.entityService.findMany("api::fund.fund", {
    populate: ["sft", "defaultPackages", "vault"],
  });
  if (fundEntities.length === 0) {
    return;
  }
  /* Step 02 - Find watch sft and vault contract addresses */
  const watchSFTContracts = fundEntities
    .map((fundEntity) => {
      if (fundEntity?.sft?.contractAddress) {
        return fundEntity.sft.contractAddress;
      } else {
        return null;
      }
    })
    .filter((contractAddress) => contractAddress !== null);
  if (watchSFTContracts.length === 0) {
    return;
  }
  const watchVaultContracts = fundEntities
    .map((fundEntity) => {
      if (fundEntity?.vault?.contractAddress) {
        return fundEntity.vault.contractAddress;
      } else {
        return null;
      }
    })
    .filter((contractAddress) => contractAddress !== null);
  if (watchVaultContracts.length === 0) {
    return;
  }
  /* Step 03 - Find latest event log entity */
  const tokenEventLogEntities = await app.entityService.findMany(
    "api::event-log.event-log",
    {
      start: 0,
      limit: 1,
      sort: "createdAt:desc",
    }
  );
  if (tokenEventLogEntities.length !== 0) {
    latestTokenEventLogBlockNumber = tokenEventLogEntities[0].blockNumber;
    latestTokenEventLogIndex = tokenEventLogEntities[0].logIndex;
  }
  /* Step 04 - Fetch logs from blockchain */
  const txLogsResponse = await alchemy.core.getLogs({
    fromBlock: latestTokenEventLogBlockNumber,
    address: watchSFTContracts,
    topics: [
      [
        TRANSFER_TOKEN_EVENT_HASH,
        TRANSFER_VALUE_EVENT_HASH,
        SLOT_CHANGED_EVENT_HASH,
      ],
    ],
  });
  const claimTxLogsResponse = await alchemy.core.getLogs({
    fromBlock: latestTokenEventLogBlockNumber,
    address: watchVaultContracts,
    topics: [[CLAIM_EVENT_HASH]],
  });

  for await (let txLog of txLogsResponse) {
    if (
      latestTokenEventLogBlockNumber === txLog.blockNumber &&
      latestTokenEventLogIndex >= txLog.logIndex
    ) {
      continue;
    }

    const topics = txLog.topics;
    const eventNameHash = topics[0];
    const fundEntity = fundEntities.find(
      (fund) =>
        fund.sft.contractAddress.toLowerCase() === txLog.address.toLowerCase()
    );

    /* Detect log action - MintPackage, TransferToken, TransferValue, ChangeSlot, Stake, Unstake, Burn */
    if (eventNameHash === TRANSFER_VALUE_EVENT_HASH) {
      const { _fromTokenId, _toTokenId, _value } = web3.eth.abi.decodeLog(
        TRANSFER_VALUE_EVENT_ABI,
        txLog.data,
        txLog.topics.slice(1)
      );

      /* ------------ TransferValue ------------ */
      await app.entityService.create("api::event-log.event-log", {
        data: {
          action: "TransferValue",
          blockNumber: txLog.blockNumber,
          blockHash: txLog.blockHash,
          transactionIndex: txLog.transactionIndex,
          sftAddress: txLog.address,
          data: txLog.data,
          topics: txLog.topics,
          transactionHash: txLog.transactionHash,
          logIndex: txLog.logIndex,
        },
      });

      const fromTokenEntities = await app.entityService.findMany(
        "api::token.token",
        {
          filters: {
            contractAddress: {
              $eqi: fundEntity.sft.contractAddress,
            },
            tokenId: {
              $eqi: web3.utils.padLeft(
                web3.utils.toHex(_fromTokenId as bigint),
                64
              ),
            },
          },
        }
      );
      if (fromTokenEntities.length !== 0) {
        const tokenEntity = fromTokenEntities[0];
        await app.db.query("api::token.token").update({
          where: {
            id: tokenEntity.id,
          },
          data: {
            tokenValue: N(tokenEntity.tokenValue)
              .sub(_value as string)
              .toString(),
          },
        });
      }

      const toTokenEntities = await app.entityService.findMany(
        "api::token.token",
        {
          filters: {
            contractAddress: {
              $eqi: fundEntity.sft.contractAddress,
            },
            tokenId: {
              $eqi: web3.utils.padLeft(
                web3.utils.toHex(_toTokenId as bigint),
                64
              ),
            },
          },
        }
      );
      if (toTokenEntities.length !== 0) {
        const tokenEntity = toTokenEntities[0];
        await app.db.query("api::token.token").update({
          where: {
            id: tokenEntity.id,
          },
          data: {
            tokenValue: N(tokenEntity.tokenValue)
              .add(_value as string)
              .toString(),
          },
        });
      }

      continue;
    } else if (eventNameHash === SLOT_CHANGED_EVENT_HASH) {
      const { _tokenId, _newSlot } = web3.eth.abi.decodeLog(
        SLOT_CHANGED_EVENT_ABI,
        txLog.data,
        txLog.topics.slice(1)
      );

      /* -------------- ChangeSlot ------------- */
      await app.entityService.create("api::event-log.event-log", {
        data: {
          action: "ChangeSlot",
          blockNumber: txLog.blockNumber,
          blockHash: txLog.blockHash,
          transactionIndex: txLog.transactionIndex,
          sftAddress: txLog.address,
          data: txLog.data,
          topics: txLog.topics,
          transactionHash: txLog.transactionHash,
          logIndex: txLog.logIndex,
        },
      });

      const tokenEntities = await app.db.query("api::token.token").findMany({
        where: {
          contractAddress: {
            $eqi: fundEntity.sft.contractAddress,
          },
          tokenId: {
            $eqi: web3.utils.padLeft(web3.utils.toHex(_tokenId as bigint), 64),
          },
        },
      });
      if (tokenEntities.length !== 0) {
        const tokenEntity = tokenEntities[0];
        const packageId = fundEntity.defaultPackages.find(
          (pkg) => pkg.packageId === _newSlot.toString()
        )?.id;
        await app.db.query("api::token.token").update({
          where: {
            id: tokenEntity.id,
          },
          data: {
            package: packageId || null,
          },
        });
      }

      continue;
    } else if (eventNameHash === TRANSFER_TOKEN_EVENT_HASH) {
      const { _from, _to, _tokenId } = web3.eth.abi.decodeLog(
        TRANSFER_TOKEN_EVENT_ABI,
        txLog.data,
        txLog.topics.slice(1)
      );

      /* ------------- MintPackage; ------------ */
      if (_from === "0x0000000000000000000000000000000000000000") {
        await app.entityService.create("api::event-log.event-log", {
          data: {
            action: "MintPackage",
            blockNumber: txLog.blockNumber,
            blockHash: txLog.blockHash,
            transactionIndex: txLog.transactionIndex,
            sftAddress: txLog.address,
            data: txLog.data,
            topics: txLog.topics,
            transactionHash: txLog.transactionHash,
            logIndex: txLog.logIndex,
          },
        });

        await app.entityService.create("api::token.token", {
          data: {
            belongToFund: fundEntity.id,
            contractAddress: fundEntity.sft.contractAddress,
            tokenId: web3.utils.padLeft(
              web3.utils.toHex(_tokenId as bigint),
              64
            ),
            owner: _to as string,
          },
        });

        continue;
      }

      /* ----------------- Burn ---------------- */
      if (_to === "0x0000000000000000000000000000000000000000") {
        await app.entityService.create("api::event-log.event-log", {
          data: {
            action: "Burn",
            blockNumber: txLog.blockNumber,
            blockHash: txLog.blockHash,
            transactionIndex: txLog.transactionIndex,
            sftAddress: txLog.address,
            data: txLog.data,
            topics: txLog.topics,
            transactionHash: txLog.transactionHash,
            logIndex: txLog.logIndex,
          },
        });

        const tokenEntities = await app.entityService.findMany(
          "api::token.token",
          {
            filters: {
              contractAddress: {
                $eqi: fundEntity.sft.contractAddress,
              },
              tokenId: {
                $eqi: web3.utils.padLeft(
                  web3.utils.toHex(_tokenId as bigint),
                  64
                ),
              },
            },
          }
        );
        if (tokenEntities.length !== 0) {
          const tokenEntity = tokenEntities[0];
          await app.db.query("api::token.token").update({
            where: {
              id: tokenEntity.id,
            },
            data: {
              status: "Burned",
            },
          });
        }

        continue;
      }

      /* --------------- Unstake --------------- */
      if (
        (_from as string).toLowerCase() ===
        fundEntity.vault.contractAddress.toLowerCase()
      ) {
        await app.entityService.create("api::event-log.event-log", {
          data: {
            action: "Unstake",
            blockNumber: txLog.blockNumber,
            blockHash: txLog.blockHash,
            transactionIndex: txLog.transactionIndex,
            sftAddress: txLog.address,
            data: txLog.data,
            topics: txLog.topics,
            transactionHash: txLog.transactionHash,
            logIndex: txLog.logIndex,
          },
        });

        const tokenEntities = await app.entityService.findMany(
          "api::token.token",
          {
            filters: {
              contractAddress: {
                $eqi: fundEntity.sft.contractAddress,
              },
              tokenId: {
                $eqi: web3.utils.padLeft(
                  web3.utils.toHex(_tokenId as bigint),
                  64
                ),
              },
            },
          }
        );
        if (tokenEntities.length !== 0) {
          const tokenEntity = tokenEntities[0];
          await app.db.query("api::token.token").update({
            where: {
              id: tokenEntity.id,
            },
            data: {
              status: "Holding",
            },
          });
        }

        continue;
      }

      /* ---------------- Stake ---------------- */
      if (
        (_to as string).toLowerCase() ===
        fundEntity.vault.contractAddress.toLowerCase()
      ) {
        await app.entityService.create("api::event-log.event-log", {
          data: {
            action: "Stake",
            blockNumber: txLog.blockNumber,
            blockHash: txLog.blockHash,
            transactionIndex: txLog.transactionIndex,
            sftAddress: txLog.address,
            data: txLog.data,
            topics: txLog.topics,
            transactionHash: txLog.transactionHash,
            logIndex: txLog.logIndex,
          },
        });

        const tokenEntities = await app.entityService.findMany(
          "api::token.token",
          {
            filters: {
              contractAddress: {
                $eqi: fundEntity.sft.contractAddress,
              },
              tokenId: {
                $eqi: web3.utils.padLeft(
                  web3.utils.toHex(_tokenId as bigint),
                  64
                ),
              },
            },
          }
        );
        if (tokenEntities.length !== 0) {
          const tokenEntity = tokenEntities[0];
          await app.db.query("api::token.token").update({
            where: {
              id: tokenEntity.id,
            },
            data: {
              status: "Staking",
            },
          });
        }

        continue;
      }

      /* ------------ TransferToken ------------ */
      await app.entityService.create("api::event-log.event-log", {
        data: {
          action: "TransferToken",
          blockNumber: txLog.blockNumber,
          blockHash: txLog.blockHash,
          transactionIndex: txLog.transactionIndex,
          sftAddress: txLog.address,
          data: txLog.data,
          topics: txLog.topics,
          transactionHash: txLog.transactionHash,
          logIndex: txLog.logIndex,
        },
      });

      const tokenEntities = await app.entityService.findMany(
        "api::token.token",
        {
          filters: {
            contractAddress: {
              $eqi: fundEntity.sft.contractAddress,
            },
            tokenId: {
              $eqi: web3.utils.padLeft(
                web3.utils.toHex(_tokenId as bigint),
                64
              ),
            },
          },
        }
      );
      if (tokenEntities.length !== 0) {
        const tokenEntity = tokenEntities[0];
        await app.db.query("api::token.token").update({
          where: {
            id: tokenEntity.id,
          },
          data: {
            owner: _to as string,
          },
        });
      }

      continue;
    }
  }
  for await (let txLog of claimTxLogsResponse) {
    if (
      latestTokenEventLogBlockNumber === txLog.blockNumber &&
      latestTokenEventLogIndex >= txLog.logIndex
    ) {
      continue;
    }

    const topics = txLog.topics;
    const eventNameHash = topics[0];

    if (eventNameHash === CLAIM_EVENT_HASH) {
      const { owner, amount } = web3.eth.abi.decodeLog(
        CLAIM_EVENT_ABI,
        txLog.data,
        txLog.topics.slice(1)
      );

      await app.entityService.create("api::event-log.event-log", {
        data: {
          action: "Claim",
          blockNumber: txLog.blockNumber,
          blockHash: txLog.blockHash,
          transactionIndex: txLog.transactionIndex,
          sftAddress: txLog.address,
          data: txLog.data,
          topics: txLog.topics,
          transactionHash: txLog.transactionHash,
          logIndex: txLog.logIndex,
        },
      });

      const walletEntities = await app.entityService.findMany(
        "api::wallet.wallet",
        {
          filters: {
            address: {
              $eqi: owner as string,
            },
          },
          populate: ["user"],
        }
      );
      if (walletEntities.length) {
        await app.service("api::point-record.point-record").logPointRecord({
          type: "StakeShare",
          user: walletEntities[0].user,
          earningExp: 0,
          earningPoints: N(amount as string)
            .div(N(10).pow(18))
            .round()
            .toNumber(),
          receipt: {
            userId: walletEntities[0].user.id,
            exp: 0,
            points: amount.toString(),
          },
        });
      }
    }
  }

  app.server.destroy();
  app.stop(0);
};

syncEventLog();
