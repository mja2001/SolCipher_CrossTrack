**import { useState } from 'react';**

**import { ethers } from 'ethers';**

**import { create } from 'ipfs-http-client';**

**import { decryptFile, unwrapKey } from '../../lib/crypto';**



**export const FileReceive = () => {**

  **const \[fileId, setFileId] = useState('');**

  **const \[status, setStatus] = useState('');**

  **const \[loading, setLoading] = useState(false);**



  **const handleReceive = async () => {**

    **if (!fileId) {**

      **setStatus('Please enter a file ID');**

      **return;**

    **}**



    **try {**

      **setLoading(true);**

      **setStatus('Fetching file metadata...');**



      **const provider = new ethers.BrowserProvider(window.ethereum);**

      **const signer = await provider.getSigner();**

      **const contractAddress = process.env.VITE\_CONTRACT\_ADDRESS;**



      **if (!contractAddress) {**

        **throw new Error('Contract address not configured');**

      **}**



      **const contract = new ethers.Contract(**

        **contractAddress,**

        **\[**

          **'function getFile(uint256 fileId) public view returns (address sender, address recipient, bytes memory encryptedKey, string memory ipfsCid, bytes memory iv)'**

        **],**

        **signer**

      **);**



      **const fileData = await contract.getFile(fileId);**

      **const \[sender, recipient, encryptedKey, ipfsCid, iv] = fileData;**



      **setStatus('Downloading from IPFS...');**

      **const ipfs = create({ url: process.env.VITE\_IPFS\_URL || 'https://ipfs.infura.io:5001/api/v0' });**

      **const chunks = \[];**

      **for await (const chunk of ipfs.cat(ipfsCid)) {**

        **chunks.push(chunk);**

      **}**

      **const encrypted = new Uint8Array(Buffer.concat(chunks));**



      **setStatus('Unwrapping encryption key...');**

      **const encryptedKeyBytes = ethers.getBytes(encryptedKey);**

      **const nonce = encryptedKeyBytes.slice(0, 24);**

      **const wrapped = encryptedKeyBytes.slice(24);**

      

      **const senderPkBytes = ethers.getBytes(sender);**

      **const recipientSkBytes = ethers.getBytes(await signer.signMessage('solcipher-key'));**

      

      **const key = unwrapKey(wrapped, nonce, senderPkBytes, recipientSkBytes.slice(0, 32));**



      **setStatus('Decrypting file...');**

      **const ivBytes = ethers.getBytes(iv);**

      **const decrypted = await decryptFile(encrypted, key, ivBytes);**



      **const blob = new Blob(\[decrypted]);**

      **const url = URL.createObjectURL(blob);**

      **const a = document.createElement('a');**

      **a.href = url;**

      **a.download = `file-${fileId}`;**

      **a.click();**



      **setStatus('File downloaded successfully!');**

    **} catch (error: any) {**

      **setStatus(`Error: ${error.message}`);**

    **} finally {**

      **setLoading(false);**

    **}**

  **};**



  **return (**

    **<div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">**

      **<h2 className="text-2xl font-bold mb-4">Receive Encrypted File</h2>**

      

      **<div className="mb-4">**

        **<label className="block text-sm font-medium mb-2">File ID</label>**

        **<input**

          **type="text"**

          **placeholder="Enter file ID"**

          **value={fileId}**

          **onChange={e => setFileId(e.target.value)}**

          **className="w-full p-2 border rounded"**

        **/>**

      **</div>**



      **<button**

        **onClick={handleReceive}**

        **disabled={loading || !fileId}**

        **className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-300"**

      **>**

        **{loading ? 'Processing...' : 'Receive File'}**

      **</button>**



      **{status \&\& (**

        **<p className="mt-4 text-sm text-gray-600">{status}</p>**

      **)}**

    **</div>**

  **);**

**};**



