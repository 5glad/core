pragma solidity ^0.4.18;

contract Token {
  uint256 totalSupply;
  mapping (address => uint) public balances;
}
