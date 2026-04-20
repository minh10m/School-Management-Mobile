import axios from "axios";
import Constants from "expo-constants";

const SEPAY_API_URL = "https://my.sepay.vn/userapi/transactions/list";
const SEPAY_API_KEY = Constants.expoConfig?.extra?.sepayApiKey;

export interface SepayTransaction {
  id: number;
  bank_brand_name: string;
  account_number: string;
  transaction_date: string;
  amount_out: number;
  amount_in: number;
  accumulated_balance: number;
  transaction_content: string;
  reference_number: string;
  code: string | null;
  sub_account: string | null;
}

export interface SepayResponse {
  status: number;
  messages: string[];
  transactions: SepayTransaction[];
}

export const sepayService = {
  /**
   * Fetch recent transactions from Sepay and check if any match the criteria.
   * @param amount The expected amount in VNĐ.
   * @param description The unique description (e.g., fee ID).
   * @returns The matching transaction if found, otherwise null.
   */
  checkPaymentStatus: async (
    amount: number,
    description: string
  ): Promise<SepayTransaction | null> => {
    if (!SEPAY_API_KEY) {
      console.warn("Sepay API Key is missing");
      return null;
    }

    try {
      // We fetch the most recent transactions
      const response = await axios.get<SepayResponse>(SEPAY_API_URL, {
        headers: {
          Authorization: `Bearer ${SEPAY_API_KEY}`,
          "Content-Type": "application/json",
        },
        params: {
          limit: 20, // Check last 20 transactions
        },
      });

      if (response.data.status === 200 && response.data.transactions) {
        // Find a transaction where amount matches and description is contained in transaction_content
        const match = response.data.transactions.find((tx) => {
          const amountMatches = Number(tx.amount_in) === amount;
          const contentMatches = tx.transaction_content
            .toLowerCase()
            .includes(description.toLowerCase());
          return amountMatches && contentMatches;
        });

        return match || null;
      }
      return null;
    } catch (error) {
      console.error("Error checking Sepay status:", error);
      return null;
    }
  },
};
