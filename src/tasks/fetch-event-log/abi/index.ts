export const TRANSFER_TOKEN_EVENT_HASH =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
export const TRANSFER_TOKEN_EVENT_ABI = [
  {
    indexed: true,
    internalType: "address",
    name: "_from",
    type: "address",
  },
  {
    indexed: true,
    internalType: "address",
    name: "_to",
    type: "address",
  },
  {
    indexed: true,
    internalType: "uint256",
    name: "_tokenId",
    type: "uint256",
  },
];

export const TRANSFER_VALUE_EVENT_HASH =
  "0x0b2aac84f3ec956911fd78eae5311062972ff949f38412e8da39069d9f068cc6";
export const TRANSFER_VALUE_EVENT_ABI = [
  {
    indexed: true,
    internalType: "uint256",
    name: "_fromTokenId",
    type: "uint256",
  },
  {
    indexed: true,
    internalType: "uint256",
    name: "_toTokenId",
    type: "uint256",
  },
  {
    indexed: false,
    internalType: "uint256",
    name: "_value",
    type: "uint256",
  },
];

export const SLOT_CHANGED_EVENT_HASH =
  "0xe4f48c240d3b994948aa54f3e2f5fca59263dfe1d52b6e4cf39a5d249b5ccb65";
export const SLOT_CHANGED_EVENT_ABI = [
  {
    indexed: true,
    internalType: "uint256",
    name: "_tokenId",
    type: "uint256",
  },
  {
    indexed: true,
    internalType: "uint256",
    name: "_oldSlot",
    type: "uint256",
  },
  {
    indexed: true,
    internalType: "uint256",
    name: "_newSlot",
    type: "uint256",
  },
];

export const CLAIM_EVENT_HASH =
  "0x47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4";
export const CLAIM_EVENT_ABI = [
  {
    indexed: true,
    internalType: "address",
    name: "owner",
    type: "address",
  },
  {
    indexed: true,
    internalType: "uint256",
    name: "amount",
    type: "uint256",
  },
];
