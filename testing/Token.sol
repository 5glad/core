pragma solidity ^0.4.18;

contract Token {
  uint256 totalSupply;
  mapping (address => uint) public balances;

  event Transfer(address indexed from, address indexed to, uint256 _value);

  function balanceOf(address addr) public view returns (uint) {
    return balances[addr];
  }

  function transfer(address to, uint256 value) public {
    require(balances[msg.sender] >= value);
    balances[msg.sender] -= value;
    balances[to] += value;
    Transfer(msg.sender, to, value);
  }

  function mint(address to, uint256 value) public {
    balances[to] += value;
    Transfer(0x0, to, value);
  }
}
