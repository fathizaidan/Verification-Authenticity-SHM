// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Certificate {

    mapping(string => string) private certificates;

    function storeCertificate(string memory certNumber, string memory hashData) public {
        certificates[certNumber] = hashData;
    }

    function getCertificate(string memory certNumber) public view returns (string memory) {
        return certificates[certNumber];
    }

    function verifyCertificate(string memory certNumber, string memory hashData) public view returns (bool) {
        return keccak256(bytes(certificates[certNumber])) == keccak256(bytes(hashData));
    }
}
