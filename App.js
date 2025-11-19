import './App.css';
import { useEffect, useState } from 'react';
import {
  Program,
  AnchorProvider,
  BN,
  web3
} from '@coral-xyz/anchor';
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Keypair
} from '@solana/web3.js';
import idl from './idl.json';

const { SystemProgram } = web3;

// Replace with your deployed program ID
const programID = new PublicKey('FRs2XJmvEULEm4X1Y17nZ8rmKMU7R1EqJVLMZxCTez6Q');

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana wallet not found! Get Phantom Wallet.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
    }
  };

  const getProvider = () => {
    const network = clusterApiUrl('devnet');
    const connection = new Connection(network, 'processed');
    const provider = new AnchorProvider(connection, window.solana, { preflightCommitment: 'processed' });
    return provider;
  };

  const initializeAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = Keypair.generate();

      await program.methods
        .initialize(new BN(1234))
        .accounts({
          myAccount: account.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([account])
        .rpc();

      console.log('Initialized account:', account.publicKey.toString());
      const fetchedAccount = await program.account.myAccount.fetch(account.publicKey);
      console.log('Data:', fetchedAccount.data.toString());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet}>Connect to Wallet</button>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>SolCipher Multichain App</h1>
        {!walletAddress && renderNotConnectedContainer()}
        {walletAddress && (
          <div>
            <p>Wallet: {walletAddress}</p>
            <button onClick={initializeAccount}>Initialize Account</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;