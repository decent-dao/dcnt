import { ethers } from "ethers";
import { Beneficiary, BeneficiaryType } from "../DaoBuilder/types";

/**
 * List of all beneficiaries + amounts of locked token to receive on
 * DCNT token deployment
 */
export const beneficiaries: Beneficiary[] = [
  {
    type: BeneficiaryType.Purchaser,
    address: "0x3bF0009f38B7509e98Df9be70e4d055def1F736f",
    lockedAmount: ethers.parseEther("21694"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x136aF8700349F6B12c41cC60EC78636F23F3C1A2",
    lockedAmount: ethers.parseEther("130165"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xfc0F4536be1BC55E742641FcDd639b575AA49726",
    lockedAmount: ethers.parseEther("101239"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x69FEEFA21D50F510f409341BaA7282f1C380c657",
    lockedAmount: ethers.parseEther("8928571"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x767Ddb516601C8d1C536D40c81d8d7e959F45554",
    lockedAmount: ethers.parseEther("17857143"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xb69FB5068AF1d3b1Ae1BC8CC8D37E12F83FEFAe4",
    lockedAmount: ethers.parseEther("446429"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xE207AB8FA4496a42359476a055799930cD78B786",
    lockedAmount: ethers.parseEther("5138032"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x8DA08B81F87AF88c1ef80b31E9Ddd7d6923fD256",
    lockedAmount: ethers.parseEther("16964286"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x13028abfC55618eC92E2A4FbddA9853a544bd61b",
    lockedAmount: ethers.parseEther("4464286"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xfE9EcB4b9a3c03F6da859ff7209f6e4e618bC9bD",
    lockedAmount: ethers.parseEther("86776"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x384d9161A088676fCfbF8E73bd290902fA315fD2",
    lockedAmount: ethers.parseEther("4464286"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xe294Dc2cbB49472be1Cf2BEefF971D45859Bb89C",
    lockedAmount: ethers.parseEther("430616"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4f721c28c9a3501411B5da51F86dA1e32f27d06b",
    lockedAmount: ethers.parseEther("116406"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x1904f94Fa6D99873D82B19cAa889cC1dAe082797",
    lockedAmount: ethers.parseEther("446429"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xB371D7a901D88577ccd70f1dD990f9EF2f4141E0",
    lockedAmount: ethers.parseEther("446429"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x18C529e97297C7d7da79779714B288F5C034EBE1",
    lockedAmount: ethers.parseEther("115702"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xBAa386854fA9092A864DAAAee927f2c1dB973d46",
    lockedAmount: ethers.parseEther("892857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x05A1ff0a32bc24265BCB39499d0c5D9A6cb2011c",
    lockedAmount: ethers.parseEther("14462"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x70044278D556B0C962224e095397A52287C99cB5",
    lockedAmount: ethers.parseEther("4464286"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x102447ec3EF98Cad75faACBb3eAA7fD717A0668d",
    lockedAmount: ethers.parseEther("844105"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x5D3036BF3Ae5156758f37460B7E463797857Bf80",
    lockedAmount: ethers.parseEther("8928571"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x831F7B27966075312Eb3A7B1215713631140924E",
    lockedAmount: ethers.parseEther("86776"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xc358F50FA625F2F87bF035f41cD913E2e72A8ad8",
    lockedAmount: ethers.parseEther("16252492"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x1118dA712e636C1C918c21B9d2048F1F804A8Edb",
    lockedAmount: ethers.parseEther("5357143"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xC9bcdaad3c80F2fC09477Bd066943fD32d5a61A7",
    lockedAmount: ethers.parseEther("8126246"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x1BF3CC63cAA483Aa8aC7bCeEc7a2DFA8301bddF3",
    lockedAmount: ethers.parseEther("36157"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xDc2DA167c4dA18EfF846d7fFA4d1e2fFD417BAE1",
    lockedAmount: ethers.parseEther("8126246"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x23ae4B2E794823Da8A84438426e41CFfD2B1c0b1",
    lockedAmount: ethers.parseEther("892857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xB2AF2EaAf9df20177e6bC4bafE0335452A82D808",
    lockedAmount: ethers.parseEther("86776"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xf57491e223E1741b03C1D10Aa1ae5C17e3830fBF",
    lockedAmount: ethers.parseEther("4464286"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xFd91376ba141E1ab1139bE8Ef8710D81f9d65FEC",
    lockedAmount: ethers.parseEther("446429"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xCea5F8a3fF46ffd5598D04cB445513AC66384e99",
    lockedAmount: ethers.parseEther("117441"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x50d827df76BCc8372D5b9f3B938c5f23c6866Bd1",
    lockedAmount: ethers.parseEther("6054654"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xde6f8Af3BCbbAadf36A43921C2FA2a318d8799b6",
    lockedAmount: ethers.parseEther("8928571"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x7d6c8915758BD758Af8B914d1Faf19320d36dF09",
    lockedAmount: ethers.parseEther("36157"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xda7B2b70e393533d845220943AA7a2514f01B2EE",
    lockedAmount: ethers.parseEther("405401"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x8E48F46411b6fFF9844db95A363d96C5e99df1d1",
    lockedAmount: ethers.parseEther("101239"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x43Ca16d2e865eAA2EbDfa81f2D5Fecb5fDe42c56",
    lockedAmount: ethers.parseEther("3571429"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xdAE8d84d85c9704317df8B318b00043ad1d3981F",
    lockedAmount: ethers.parseEther("1785714"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x2fB3AA22b7aDd6252c5392D0B3423eC9a72bF024",
    lockedAmount: ethers.parseEther("892857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xa680C5b31906aaaD08D2b95c5114c1759B3c21d9",
    lockedAmount: ethers.parseEther("17857143"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x1AF57307472472a0929DE14E1bDc665300aca9df",
    lockedAmount: ethers.parseEther("6165638"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x2463Dc8Dec617bfCf1A53d1e54D6C9ef4E7E0F78",
    lockedAmount: ethers.parseEther("8928571"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4fe0E97304d520B2bFc24f0A0DF4b9D9DA3b86FD",
    lockedAmount: ethers.parseEther("8928571"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x9Bedb92ee7e1B3Cf7a4420ae1075EA38F6786A96",
    lockedAmount: ethers.parseEther("2446325"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xa9b49C8c68475c4E013b15cc49AEE3f8091060D9",
    lockedAmount: ethers.parseEther("4063123"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xdb21Fd4AC1AC9A45e6E1CD1E823aCCAAAab96bd7",
    lockedAmount: ethers.parseEther("17857143"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x408505ec4bb812b9b649a653390a7b683cea3d54",
    lockedAmount: ethers.parseEther("18750000"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x31da377eda7d29d4aa15df81d90148649a8f734d",
    lockedAmount: ethers.parseEther("332749"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x9Aa590A2A8Fc4c3332D625bCB6d7578611675b6C",
    lockedAmount: ethers.parseEther("28925"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xb647CD4c36CBd15b50E9aA07d6A190e88d99bdAF",
    lockedAmount: ethers.parseEther("17857143"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x796307f46b108661600e252a23faa2ee11ee6e23",
    lockedAmount: ethers.parseEther("1174407"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xDB131c83b44A055750b49107031AA77B633148aB",
    lockedAmount: ethers.parseEther("17857143"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x522C5eaf12C73AD2c85d1eEDfdf13A49491986C8",
    lockedAmount: ethers.parseEther("78294"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x78a1734E11BF5d678dBca8621832176Ef74d12B7",
    lockedAmount: ethers.parseEther("3571429"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x18539F4188fb8B4f65a4EceCE9223d81Cd55E14d",
    lockedAmount: ethers.parseEther("17857143"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x1C06e2d50FbafA7F81084cc165f7C35b8f5ec270",
    lockedAmount: ethers.parseEther("14462"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x58f5F0684C381fCFC203D77B2BbA468eBb29B098",
    lockedAmount: ethers.parseEther("8928571"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x79aE6959B94842D7934dbe43Cc2400e646Ef828e",
    lockedAmount: ethers.parseEther("8928571"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x4ADB15d518AA61B0a17749eB2078c960D224D3bE",
    lockedAmount: ethers.parseEther("892857"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x48c32F704535ddf5bc40F45A34620422958a1D21",
    lockedAmount: ethers.parseEther("8126246"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xaD8B63A34a77C2F9322cABf120cbF15F8a36DCC8",
    lockedAmount: ethers.parseEther("446429"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xfabc4535b77D713Fd4C9cAE75A4812454D3082C1",
    lockedAmount: ethers.parseEther("1137707"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4eC619dc0C53201Bf7f5981f0Ac0a97f93Ef937b",
    lockedAmount: ethers.parseEther("36157"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xF4a0a3c2121e6962bbf75FC43CdbEB341f7ef3A0",
    lockedAmount: ethers.parseEther("274028"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x575c8A992EC082f3650432dE77c1CbBCCf568200",
    lockedAmount: ethers.parseEther("117441"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4dd0Bda152fDB26468ADF0Aa1854DF8C7D7D9667",
    lockedAmount: ethers.parseEther("17857143"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x614C5A007C21E522B9A74B3d455Daa8F899923D8",
    lockedAmount: ethers.parseEther("8126246"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xd8f82769b862f4971210f9bede3793f80ac71dcc",
    lockedAmount: ethers.parseEther("1174407"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xc11CeDCE5C6d98931134087C2CAC3E5Ac4E3d105",
    lockedAmount: ethers.parseEther("892857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x22791a7Bf3FfC92bCdf08510a3d69B51fC0481fF",
    lockedAmount: ethers.parseEther("446429"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x642C166C03042B51AaDb70Cc81311fe50A45A55f",
    lockedAmount: ethers.parseEther("2348815"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x2304ecc3496344DF06A5d19B02E251b8614C2872",
    lockedAmount: ethers.parseEther("8928571"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xcC9B2AA4D607cE4c6952beE7fAb292d40B4B6dF2",
    lockedAmount: ethers.parseEther("2333341"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x58739f75B7c8B74477A4974Aac0c8b6F51839291",
    lockedAmount: ethers.parseEther("8928571"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x68de049713d672C711D373E1cC23F2BeA2024b86",
    lockedAmount: ethers.parseEther("446429"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x095B0846b271e0AAEBb49dD5b389F0a17fdAF9C4",
    lockedAmount: ethers.parseEther("4017857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x39c765fa8b3B799DC4A67141aFE3FF49d7c6560a",
    lockedAmount: ethers.parseEther("548057"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x392CaeF8Cb57bBaf02f0A2EB89f11d72308F9cDD",
    lockedAmount: ethers.parseEther("1785714"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x0fD174DB454c5Ba665C3a60480d11A4f232f8bB4",
    lockedAmount: ethers.parseEther("1174407"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x7Be71Ac86DdfEE76d75B13723BC05f06D42a30a0",
    lockedAmount: ethers.parseEther("4464286"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xdD3Ad63F5B2E5e11DCAb3c4E70Db4066d8BcD687",
    lockedAmount: ethers.parseEther("4464286"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x9F543FD939C3206A47A5E7848c4920CEF20bf6FF",
    lockedAmount: ethers.parseEther("2678571"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x7f8B9fa32E2167922448E87A716776379e7f2a18",
    lockedAmount: ethers.parseEther("2495615"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xd8f811356fdC05d2dD56516D3dF7ce76dFeF588d",
    lockedAmount: ethers.parseEther("101239"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xd1c5a0effa3fd37e63d90ec34263befa3deba514",
    lockedAmount: ethers.parseEther("2449044"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x3437d910aCA6001CBcEDEeD7C8540dF6f5722d5D",
    lockedAmount: ethers.parseEther("1174407"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4Fdd2d00df223d085C9EC5116dDbBefDf23ef5cC",
    lockedAmount: ethers.parseEther("5321533"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x9Bedb92ee7e1B3Cf7a4420ae1075EA38F6786A96",
    lockedAmount: ethers.parseEther("8126246"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4feA3f953d80f771CCd6B1F94B01995b551691D4",
    lockedAmount: ethers.parseEther("1785714"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x110d1907414679f35ee474212b1b1350704a4154",
    lockedAmount: ethers.parseEther("367500"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x2884b7Bf17Ca966bB2e4099bf384734a48885Df0",
    lockedAmount: ethers.parseEther("587204"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x78c631Ed6c759E48D1F883BAaC12787f98725dD3",
    lockedAmount: ethers.parseEther("9445261"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x7FC728d7Fc300dd21845c99A0e824154da8F2050",
    lockedAmount: ethers.parseEther("8126246"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xccd4ff5710aa5f78fc93120fd3e70a17fe8d53c0",
    lockedAmount: ethers.parseEther("4464286"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xAF0cE2c1D62C356dC4fae45D3b732b4ecE3211D2",
    lockedAmount: ethers.parseEther("1785714"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x723cd2a9678F384A81d99a63752905923Be3624e",
    lockedAmount: ethers.parseEther("14462"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x074a81c7b12f60381159513751D270038C9d289c",
    lockedAmount: ethers.parseEther("8928571"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xe3034f517Bc4c684de26DBE7305334e03C499429",
    lockedAmount: ethers.parseEther("17857143"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4f21AEd48292Ff8E91541d92002CcE1835181945",
    lockedAmount: ethers.parseEther("892857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x96b5603d8C1b8c006A8a2D181A51c18386496737",
    lockedAmount: ethers.parseEther("43388"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xCD5312c631224653de42C018D47D4a0912296AEA",
    lockedAmount: ethers.parseEther("17857143"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x7de4D0f427dcfD44bE15539c7133F9660D2e8c30",
    lockedAmount: ethers.parseEther("4464286"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x4190C9f53B01207D07C77AEa55479CE7646283c1",
    lockedAmount: ethers.parseEther("2441812"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x3df022e515091fb8E53389C4a5B3AaFd82051E4D",
    lockedAmount: ethers.parseEther("892857"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xf9c27dd9194c21F2395E8dCF0048cF2a1463A051",
    lockedAmount: ethers.parseEther("446429"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x30c6b82228959F1bc053095FF84f0179c1339304",
    lockedAmount: ethers.parseEther("72314"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xc88c70506C935F15148047Bf204D68FbbDBC3a54",
    lockedAmount: ethers.parseEther("36157"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0x7675d7C383A5CcdBcd5C2090783BF949c11052C3",
    lockedAmount: ethers.parseEther("14462"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xF6fCf1A661E7757dc2e9f08E3126eD7036f9500a",
    lockedAmount: ethers.parseEther("97867"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xB7e743A46497e6596feA837AdbC0E1cc6b14e9b8",
    lockedAmount: ethers.parseEther("72314"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xc269d6D699d1D5234A09e487c5B47614B6C69870",
    lockedAmount: ethers.parseEther("115702"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0x03Dfc45F874c8e3e3bF4b580775611A9780BA064",
    lockedAmount: ethers.parseEther("5625000"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xd9c66fc2b01Bb6d72e8884d2AA1e2DDA2995ecD6",
    lockedAmount: ethers.parseEther("1785714"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xcbe096751823d458Dc6A0b8169FF55F9C2fBD952",
    lockedAmount: ethers.parseEther("892857"),
  },
  {
    type: BeneficiaryType.Purchaser,
    address: "0xf26d75b2Fc048F1F6C793aE9F939Fa0946a0E104",
    lockedAmount: ethers.parseEther("5089098"),
  },
  {
    type: BeneficiaryType.Investor,
    address: "0xAaD964d90842a967e01132C2217814C455E8Fd90",
    lockedAmount: ethers.parseEther("1785714"),
  },
];
