import { ethers } from "ethers";
import { Beneficiary, BeneficiaryType } from "../DaoBuilder/types";

/**
 * List of all beneficiaries + amounts of locked token to receive on
 * DCNT token deployment
 */
export const beneficiaries: Beneficiary[] = [
  {
    type: BeneficiaryType.Investor,
    address: "0xA7a4e82557c83f7D6db0DCaE338114BF6C812838",
    lockedAmount: ethers.parseEther("8207508"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xdF9afe57CC5F811569e9705CC32B1aa9C9661c86",
    lockedAmount: ethers.parseEther("2253120"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x1aEd529dDFd821a852D4505Fd1de09A18620Fa41",
    lockedAmount: ethers.parseEther("4022492"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xECaC1eF81D735Fd326C37832d4a15DF6151c3Eae",
    lockedAmount: ethers.parseEther("1857143"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xFac7F896B78B8a2137DF8f23216ABa9218e3B18A",
    lockedAmount: ethers.parseEther("17142857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xfcf7a2794D066110162ADdcE3085dfd6221D4ddD",
    lockedAmount: ethers.parseEther("866071"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xdEb709467712AD39881771894C345272958a6e1D",
    lockedAmount: ethers.parseEther("4330357"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xc4E3321c26Dca81bd0bBd189B34ebaD2e05e4C31",
    lockedAmount: ethers.parseEther("19285714"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x152870C1ec20cd6211454204Cd749317Fa4c9297",
    lockedAmount: ethers.parseEther("8839285"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xc60a52B7529b3B228430694308bfeb0298429332",
    lockedAmount: ethers.parseEther("1268360"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xF2147DC770A87651fB0bD948483741b4a80B2EA5",
    lockedAmount: ethers.parseEther("946428"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x90EF08d20bFdcbdb5Df9237F67A14DBaF3f406B5",
    lockedAmount: ethers.parseEther("491072"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xDA225200E31358124F67a364c819ACB445D980FE",
    lockedAmount: ethers.parseEther("114545"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xFf1505C810c735286998D232000f89128Dff3ff3",
    lockedAmount: ethers.parseEther("263067"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x65F69B0114aD756b8a34391a47fB3289aCD312b9",
    lockedAmount: ethers.parseEther("9285714"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x637366C372a9096b262bd2fe6c40D7BCc6239976",
    lockedAmount: ethers.parseEther("569588"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x0d58dBD2A8950db14DEe6680221219aAE04fCb6a",
    lockedAmount: ethers.parseEther("8392857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x0F76a26CF705AD98A4e73AD0a5eAf352fFc9BBC9",
    lockedAmount: ethers.parseEther("17500000"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x8F0522E93AA74552C3db3F410491FFF74435A287",
    lockedAmount: ethers.parseEther("18750000"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x37807554AbB1A1B4a326efb46619f24D5265DB14",
    lockedAmount: ethers.parseEther("79834"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x1AF435fD7773BF927F62e34a32158Dc841042Eb1",
    lockedAmount: ethers.parseEther("8750000"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x7B681Cd05E47E7aaf4842FCE450fFB3489446BAa",
    lockedAmount: ethers.parseEther("14173"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x8F102Ee92720D819ab432117c3d95153FF84427b",
    lockedAmount: ethers.parseEther("21477"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x09eee25c2b05eCD3e4d43b9B2f3C2611383dF773",
    lockedAmount: ethers.parseEther("4330357"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x460969FF07fF00964FedB41192cf7cd27c6605F0",
    lockedAmount: ethers.parseEther("306129"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x3e410C588bB42292Bb02f1316E6Eb1F6fA27d502",
    lockedAmount: ethers.parseEther("8207508"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xeD72e42c29a60Ce73f50D76315c244EC2D5bF15D",
    lockedAmount: ethers.parseEther("4419643"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xa179aD42C3383CeE0B9878F48256F8BFD74336Ef",
    lockedAmount: ethers.parseEther("83305"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x787F227908D123831307Ab73054D96f3E673Cf0d",
    lockedAmount: ethers.parseEther("8126246"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xde379A5241fee348f50fAed0FD2fd7faC4D7e492",
    lockedAmount: ethers.parseEther("473215"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4EF009638F2Ed97124251a7596dA7A355CC82b2a",
    lockedAmount: ethers.parseEther("2286674"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x437a5CEe80C21fffBc68BE276df082D86582F056",
    lockedAmount: ethers.parseEther("34349"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xB8e9B4D4992D9b40922DfDDE491cF72018416Eac",
    lockedAmount: ethers.parseEther("9375000"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xb5A23B90E8395a2bBe9dc41A2a8511d803767027",
    lockedAmount: ethers.parseEther("9017857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xC33074Cbf581d7d065bbb8c2d11738A3C7eDA964",
    lockedAmount: ethers.parseEther("99214"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x0C804aB7f35aafD81335fd1F0D4140a62a56caFA",
    lockedAmount: ethers.parseEther("1839285"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xfcf7a2794D066110162ADdcE3085dfd6221D4ddD",
    lockedAmount: ethers.parseEther("468750"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xF03d737590fAE58Df85869e2871f9a2B608D93EF",
    lockedAmount: ethers.parseEther("120330"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x379F094bf72cDB7eF22aa38b416f200Cb770ECB5",
    lockedAmount: ethers.parseEther("1256615"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xaa426d8135D8eDA6c6D51410C833f8670a04d707",
    lockedAmount: ethers.parseEther("2231374"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x0daF70bce883fE5797Ad5914E6738B62411C4d30",
    lockedAmount: ethers.parseEther("17142857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x31178FcD14D101507e6DfD3f8b86F2D4F512344F",
    lockedAmount: ethers.parseEther("5321533"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x57680c84E29bC80FCa5daEd7Aa8Cd52F5b0A1d6c",
    lockedAmount: ethers.parseEther("81569"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x0d5e310dE9477CFAA19e499127080f25F718CB60",
    lockedAmount: ethers.parseEther("15764"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xDb5EF42805e1eE9bf865D7f845805a19707De9BB",
    lockedAmount: ethers.parseEther("2250619"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xDb5EF42805e1eE9bf865D7f845805a19707De9BB",
    lockedAmount: ethers.parseEther("8044984"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xdF6F43Efc4A30118B20F415C8ad9DC21826fDB0b",
    lockedAmount: ethers.parseEther("2490648"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x2D1FC59eC8C849e4ab4A1f1C7E5139F31Aec99F7",
    lockedAmount: ethers.parseEther("102251"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xC8375cC2C5fA34eba6aC386fECCaBaE1E51158c8",
    lockedAmount: ethers.parseEther("4783752"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xcea8bC91424CF1598E35285d7f21E3A7414C5750",
    lockedAmount: ethers.parseEther("982143"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xfAB0d4158F0f83714bA88c3497C40dDA359F54d2",
    lockedAmount: ethers.parseEther("8776346"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4E4fF53E1009f521a9f212930E542B363b4B7B47",
    lockedAmount: ethers.parseEther("46425"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x04CD172A3db00b7b9dC54E92585Ae74E03F578c8",
    lockedAmount: ethers.parseEther("3321429"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x9D354E9bb247be5b3CcA6A3E420Fa9892B66efa0",
    lockedAmount: ethers.parseEther("1642857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x9172DaDA0f14A9400FE89263232C2EfA66DE017b",
    lockedAmount: ethers.parseEther("919643"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x602B1B718f98Abfe6BaEc90BF74B2F00cae2D9C0",
    lockedAmount: ethers.parseEther("122139"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x498Ecd18D2B6BACB30671FF0C24DF156f65626E5",
    lockedAmount: ethers.parseEther("8482142"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x045d156B8d354ee3822Fd269E25E0e0a2e14fa44",
    lockedAmount: ethers.parseEther("4875000"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xe39FB2fa6aefdbA44CA54fA1106C23DeF1986A5c",
    lockedAmount: ethers.parseEther("123390"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x8973656F9c17Ef834b50Bf61C2Bc8D662FeCE75F",
    lockedAmount: ethers.parseEther("468750"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x2f71c66538610a5b95D0987d8c5A743b3D382390",
    lockedAmount: ethers.parseEther("16250000"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x87851Bd0e99114Ef43C8fe3BB0b828D4EcCc29B8",
    lockedAmount: ethers.parseEther("4419643"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x7DD25A849828F3725C2b2540663735888159fb00",
    lockedAmount: ethers.parseEther("34711"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xFFb47D1F9a6148316EDaE0A7b39aee2cCae989B8",
    lockedAmount: ethers.parseEther("415179"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xA75A222097f82494Cb2eF0a90C0C185D44729D21",
    lockedAmount: ethers.parseEther("1928571"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4006097DeEAEfEd7524f80c0b275736CE91E45A6",
    lockedAmount: ethers.parseEther("82992"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x493654A1E724B858dda431b9F859b7c5A1EfE947",
    lockedAmount: ethers.parseEther("473678"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x705769B8Ec72ddF445A101628053dF68FE3e1d2D",
    lockedAmount: ethers.parseEther("1928571"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x480A713CC9e604feb7Cff0eb17d8b3384d8e6Efa",
    lockedAmount: ethers.parseEther("19107143"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x439922cFB6C13BCe881f8412773F25c84FAe429E",
    lockedAmount: ethers.parseEther("26611"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xC1ffcc447dEcAaa9CA043C13C449e75B42102b41",
    lockedAmount: ethers.parseEther("9017857"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x6C9E7c170ed9814533B7Dba546C95390FB246e26",
    lockedAmount: ethers.parseEther("17552691"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x02279E4419553ed62A27B0B93728E01a186090B7",
    lockedAmount: ethers.parseEther("812500"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x1b05B6F1955362eDB980713e2CFE72aE9C725cA3",
    lockedAmount: ethers.parseEther("17142857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x1eD17B04A49058f904D43a89Bd4aD6795fda9C01",
    lockedAmount: ethers.parseEther("4642857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xe24C8C99c0246fdf6AD73Cea1B4F27ae60C84804",
    lockedAmount: ethers.parseEther("1221383"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xa6c862135a86AdCe14dbaBa43903d50c210bc4c1",
    lockedAmount: ethers.parseEther("8303571"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xa375e1358964baDf85C11813661a913983D7e60E",
    lockedAmount: ethers.parseEther("34711"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x2d719df2a3214aEA3aeBD5d8fEde158253d853e2",
    lockedAmount: ethers.parseEther("405401"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xa184fE25A68714233536f126EfeBB7Db24A9f4E8",
    lockedAmount: ethers.parseEther("569979"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x048De8a6E681E22C3e916a3A2D0601a2CFF3ED41",
    lockedAmount: ethers.parseEther("38326"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xbc9Cd8f4f1830796b213f3EB5A9E4aC0AFE0290e",
    lockedAmount: ethers.parseEther("8938871"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x97B5bE32D76798ade7055669189c57DeC00156f1",
    lockedAmount: ethers.parseEther("818782"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xD9185E3b81fCDbfF71065Fe49e0D6D41B258FBF4",
    lockedAmount: ethers.parseEther("468750"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x1dA66D8040c7C9Cc0112ddE7b03acF4999F4476d",
    lockedAmount: ethers.parseEther("116267"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x35d6DC8ECFb64e69D24401A11fE5F38b44503071",
    lockedAmount: ethers.parseEther("4241072"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xe5400a578e95ba10666140d6e4f2858CD6609B85",
    lockedAmount: ethers.parseEther("866071"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x93bC4B412465B561Ed011B5E0182B389168D6699",
    lockedAmount: ethers.parseEther("19125000"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xb92A8333220f4581A016c1E2F4882dAcb6fdB7dd",
    lockedAmount: ethers.parseEther("4107143"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xE857ff76F8b0694F1a4444b4D927AD9770846505",
    lockedAmount: ethers.parseEther("2295966"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x06695c050d946b8a11EB0e4ccf55808df7Aa9108",
    lockedAmount: ethers.parseEther("345450"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x69729de7a9986c1BDE7A33F4B7FE54e61DC592CB",
    lockedAmount: ethers.parseEther("4726989"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x46934993aDCb8220Eda1c002e243d64510a61a4a",
    lockedAmount: ethers.parseEther("1839285"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x796307f46b108661600e252a23faa2ee11ee6e23",
    lockedAmount: ethers.parseEther("1080454"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4cfDD0A76A1E450D83dC42325b06521E59d04084",
    lockedAmount: ethers.parseEther("1149084"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x9f7F4dc1434B68943154D01bCC221d2aE10cbd0C",
    lockedAmount: ethers.parseEther("103739"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x3fFcD798edBc5d5CeBE04BB819bE5FA596AB3BD0",
    lockedAmount: ethers.parseEther("464286"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x4b5e24d71C54bB4fB6cf35A97D64c92d425b8b78",
    lockedAmount: ethers.parseEther("424108"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xe07eeE1D273886e610c95423406a184bc63c32f6",
    lockedAmount: ethers.parseEther("3897321"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x2c6D16Bd7c5B1c9070ED1848e017622F845356Ee",
    lockedAmount: ethers.parseEther("901786"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xf2652B84cAB2B1a1e10f6DA989828437038F2beE",
    lockedAmount: ethers.parseEther("79545"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xc55322DAD35dEDEA9274c9A9882657f5F7af2E94",
    lockedAmount: ethers.parseEther("66529"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x907244Ac46f866b3092584f39C0fca37C45D7685",
    lockedAmount: ethers.parseEther("8784093"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xb56FbEa60AFa8A02E7F452d6565025deb926e5Da",
    lockedAmount: ethers.parseEther("883928"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x9b8f1bAaA2f27bEf2b508A15CDBb5534Df3755F0",
    lockedAmount: ethers.parseEther("6236294"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xC73a86Db1174027D64Fe0667b0B7D96CDf81E490",
    lockedAmount: ethers.parseEther("96177"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x3f64b3476A0e9F7ea67CebcC1D3B302e6B819b09",
    lockedAmount: ethers.parseEther("8839285"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xe54A292DBfA8A697efe8848625e8D2BF83bea007",
    lockedAmount: ethers.parseEther("14317"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x9F7bC212C5Cc250cA7B9a17fA8f4257d95DaBF9f",
    lockedAmount: ethers.parseEther("13739"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xB9357BbC7DDC3e14c0c782ee5A83DDF902F9F469",
    lockedAmount: ethers.parseEther("6782202"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x1bBa500d8C10af5cDc974C90a30745105CbD3935",
    lockedAmount: ethers.parseEther("17303572"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xc0B6F86cA10e3745903FC5A3378d443498ad742e",
    lockedAmount: ethers.parseEther("3857143"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xc28a170C662585FEbf7d66bE2B1B8458309db0fc",
    lockedAmount: ethers.parseEther("4642857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xFf691134450a20f8B1f38C34051eCd807571b8Af",
    lockedAmount: ethers.parseEther("124958"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x070647e5f69c500662DB0ce7cc254FA5aF62Ab44",
    lockedAmount: ethers.parseEther("2517857"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xa8AC1825Cf909233415aad43cdc4872579faaacC",
    lockedAmount: ethers.parseEther("5512500"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xA032F6a91dEfA7d28B5646475aB3e167F8AdfC96",
    lockedAmount: ethers.parseEther("18003594"),
  },
];
