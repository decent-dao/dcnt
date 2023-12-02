import { ethers } from "ethers";
import { Beneficiary, BeneficiaryType } from "../DaoBuilder/types";

/**
 * List of all beneficiaries + amounts of locked token to receive on
 * DCNT token deployment
 */
export const beneficiaries: Beneficiary[] = [
  {
    type: BeneficiaryType.Purchaser,
    address: "0x629750317d320B8bB4d48D345A6d699Cc855c4a6",
    lockedAmount: ethers.utils.parseEther("5"),
  },
];
