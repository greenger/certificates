pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';

contract GreenCert is ERC721Full, ERC721Mintable {
    struct record {
        address generator;
        uint begin;
        uint end;
    }

    record[] public records;
    address public founder;

    mapping (address=>bool) generators;
    mapping (address=>string) generatorsName;
    mapping (address=>bool) verificators;
    mapping (address=>string) verificatorsName;

    event RecordAdded(address indexed generator, uint indexed number);
    event Green(uint indexed number, address indexed owner);

    constructor() ERC721Full("Green Certificates", "GRN") public {
        founder = msg.sender;
    }

    modifier onlyFounder() {
        require(msg.sender == founder);
        _;
    }

    function addGenerator(address addr, string memory name) public onlyFounder {
        generators[addr] = true;
        generatorsName[addr] = name;
    }

    function addVerificator(address addr, string memory name) public onlyFounder {
        verificators[addr] = true;
        verificatorsName[addr] = name;
        addMinter(addr);
    }

    modifier onlyGenerators() {
        require(generators[msg.sender]);
        _;
    }

    function addRecord(uint begin, uint end) public onlyGenerators {
        uint idx = records.length;
        records.push(record(msg.sender, begin, end));
        emit RecordAdded(msg.sender, idx);
    }

    modifier onlyVerificators() {
        require(verificators[msg.sender]);
        _;
    }

    function approveToGreen(uint idx) public onlyVerificators {
        mint(records[idx].generator, idx);
    }

    function isGreen(uint idx) public view returns(bool, address) {
        if (_exists(idx)) {
            return (true, ownerOf(idx));
        }
        return (false, address(0x0));
    }

    function tokenURI(uint256 idx) external view returns (string memory) {
        require(_exists(idx), "ERC721Metadata: URI set of nonexistent token");
        return strConcat("http://159.69.251.155/verify/", uint2str(idx));
    }

    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }

    function strConcat(string memory _a, string memory _b) internal pure returns (string memory){
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        string memory abcde = new string(_ba.length + _bb.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (uint i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        return string(babcde);
    }
}