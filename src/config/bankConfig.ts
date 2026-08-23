import { BankConfig } from '../types';

/**
 * 銀行轉帳資訊設定 (Bank Transfer Configuration)
 * 
 * 集中管理轉帳匯款帳號資訊，方便未來無縫接入後端設定或環境變數。
 */
export const BANK_CONFIG: BankConfig = {
  bankName: '玉山商業銀行',
  bankCode: '808',
  branchName: '雙和分行',
  accountNumber: '0123-456-789012',
  accountName: '波嶼選物有限公司',
  notes: '匯款完成後請於訂單中填寫「匯款帳號後五碼」，核帳完成後將於 1-2 個工作天內出貨。',
};
