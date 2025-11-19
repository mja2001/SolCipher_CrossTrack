import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolcipherBackend } from "../target/types/solcipher_backend";

describe("solcipher_backend", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolcipherBackend as Program<SolcipherBackend>;

  it("Initializes the account", async () => {
    const myAccount = anchor.web3.Keypair.generate();

    await program.methods
      .initialize(new anchor.BN(1234))
      .accounts({
        myAccount: myAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([myAccount])
      .rpc();

    const account = await program.account.myAccount.fetch(myAccount.publicKey);
    console.log("Data:", account.data.toString());
  });
});