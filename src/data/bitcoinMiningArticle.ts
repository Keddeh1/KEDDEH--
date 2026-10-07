export const BITCOIN_MINING_HARD_WAY_TEXT = `# Bitcoin mining the hard way: the algorithms, protocols, and bytes

This article explains Bitcoin mining in details, right down to the hex data and network traffic. If you've ever wondered what really happens in Bitcoin mining, you've come to the right place. My previous article, Bitcoins the hard way described how I manually created a Bitcoin transaction and sent it into the system. In this article, I show what happens next: how a transaction gets mined into a block.

## The purpose of mining
Bitcoin mining is often thought of as the way to create new bitcoins. But that's really just a secondary purpose. The primary importance of mining is to ensure that all participants have a consistent view of the Bitcoin data. Because Bitcoin is a distributed peer-to-peer system, there is no central database that keeps track of who owns bitcoins. Instead, the log of all transactions is distributed across the network.

The main problem with a distributed transaction log is how to avoid inconsistencies that could allow someone to spend the same bitcoins twice. The solution in Bitcoin is to mine the outstanding transactions into a block of transactions approximately every 10 minutes, which makes them official. Conflicting or invalid transactions aren't allowed into a block, so the double spend problem is avoided.

Although mining transactions into blocks avoid double-spending, it raises new problems: What stops people from randomly mining blocks? How do you decide who gets to mine a block? How does the network agree on which blocks are valid? Solving those problems is the key innovation of Bitcoin: mining is made very, very difficult, a technique called proof-of-work. It takes an insanely huge amount of computational effort to mine a block, but it is easy for peers on the network to verify that a block has been successfully mined.

Each mined block references the previous block, forming an unbroken chain back to the first Bitcoin block. This blockchain ensures that everyone agrees on the transaction record. It also ensures that nobody can tamper with blocks in the chain since re-mining all the following blocks would be computationally infeasible. As long as nobody has more than half the computational resources, mining remains competitive and nobody can control the blockchain.

As a side-effect, mining adds new bitcoins to the system. For each block mined, miners currently get 25 new bitcoins (currently worth about $15,000), which encourages miners to do the hard work of mining blocks. With the possibility of receiving $15,000 every 10 minutes, there is a lot of money in mining.

## How mining works
Mining requires a task that is very difficult to perform, but easy to verify. Bitcoin mining uses cryptography, with a hash function called double SHA-256. A hash takes a chunk of data as input and shrinks it down into a smaller hash value (in this case 256 bits). With a cryptographic hash, there's no way to get a hash value you want without trying a whole lot of inputs. But once you find an input that gives the value you want, it's easy for anyone to verify the hash. Thus, cryptographic hashing becomes a good way to implement the Bitcoin "proof-of-work".

In more detail, to mine a block, you first collect the new transactions into a block. Then you hash the block to form a 256-bit block hash value. If the hash starts with enough zeros, the block has been successfully mined and is sent into the Bitcoin network and the hash becomes the identifier for the block. Most of the time the hash isn't successful, so you modify the block slightly and try again, over and over billions of times. About every 10 minutes someone will successfully mine a block, and the process starts over.

The diagram below shows the structure of a specific block, and how it is hashed. The yellow part is the block header, and it is followed by the transactions that go into the block. The first transaction is the special coinbase transaction that grants the mining reward to the miner. The remaining transactions are standard Bitcoin transactions moving bitcoins around. If the hash of the header starts with enough zeros, the block is successfully mined. For the block below, the hash is successful: 0000000000000000e067a478024addfecdc93628978aa52d91fabd4292982a50 and the block became block #286819 in the blockchain.

## Structure of a Bitcoin block
The block header contains a handful of fields that describe the block. The first field in the block is the protocol version. It is followed by the hash of the previous block in the blockchain, which ensures all the blocks form an unbroken sequence in the blockchain. (Inconveniently, the hash is reversed in the header.) The next field is the Merkle root, a special hash of all the transactions in the block. This is also a key part of Bitcoin security, since it ensures that transactions cannot be changed once they are part of a block. Next is a (moderately accurate) timestamp of the block, followed by the mining difficulty value bits. Finally, the nonce is an arbitrary value that is incremented on each hash attempt to provide a new hash value. The tricky part of mining is finding a nonce that works.

## A short program to mine a block
I wrote a Python program that mines the above block. The program itself is pretty simple - the hardest part of the code is computing the difficulty target from bits. Otherwise it's just a loop over different nonce values. Each iteration puts the data into a structure, hashes it, and tests the result.

\`\`\`python
import hashlib, struct
 
ver = 2
prev_block = "000000000000000117c80378b8da0e33559b5997f2ad55e2f7d18ec1975b9717"
mrkl_root = "871714dcbae6c8193a2bb9b2a69fe1c0440399f38d94b3a0f1b447275a29978a"
time_ = 0x53058b35 # 2014-02-20 04:57:25
bits = 0x19015f53
 
# https://en.bitcoin.it/wiki/Difficulty
exp = bits >> 24
mant = bits & 0xffffff
target_hexstr = '%064x' % (mant * (1<<(8*(exp - 3))))
target_str = target_hexstr.decode('hex')
 
nonce = 0
while nonce < 0x100000000:
    header = ( struct.pack("<L", ver) + prev_block.decode('hex')[::-1] +
          mrkl_root.decode('hex')[::-1] + struct.pack("<LLL", time_, bits, nonce))
    hash = hashlib.sha256(hashlib.sha256(header).digest()).digest()
    print nonce, hash[::-1].encode('hex')
    if hash[::-1] < target_str:
        print 'success'
        break
    nonce += 1
\`\`\`

The following table shows the hash obtained for selected nonce values. The key point is that each nonce generates a basically-random hash value. Every so often a "lucky" nonce will generate a hash starting with some zeroes. To get a lot of zeroes, you need to try an exponentially large number of nonces. For this block, the "winning" nonce is 856192328.
`;
