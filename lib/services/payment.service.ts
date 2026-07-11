interface SSLCommerzConfig {
  store_id: string
  store_password: string
  sandbox: boolean
}

interface SSLCommerzPaymentRequest {
  total_amount: number
  currency: string
  tran_id: string
  success_url: string
  fail_url: string
  cancel_url: string
  cus_name: string
  cus_email: string
  cus_phone: string
  cus_add1: string
  cus_city: string
  cus_postcode: string
  shipping_method: string
  num_of_item: number
  product_name: string
  product_category: string
}

class SSLCommerzService {
  private config: SSLCommerzConfig

  constructor() {
    this.config = {
      store_id: process.env.SSLCOMMERZ_STORE_ID || '',
      store_password: process.env.SSLCOMMERZ_STORE_PASSWORD || '',
      sandbox: process.env.SSLCOMMERZ_SANDBOX === 'true',
    }
  }

  private getBaseUrl(): string {
    return this.config.sandbox
      ? 'https://sandbox.sslcommerz.com'
      : 'https://securepay.sslcommerz.com'
  }

  async initiatePayment(paymentData: SSLCommerzPaymentRequest): Promise<string | null> {
    try {
      const params = new URLSearchParams({
        store_id: this.config.store_id,
        store_passwd: this.config.store_password,
        total_amount: String(paymentData.total_amount),
        currency: paymentData.currency,
        tran_id: paymentData.tran_id,
        success_url: paymentData.success_url,
        fail_url: paymentData.fail_url,
        cancel_url: paymentData.cancel_url,
        cus_name: paymentData.cus_name,
        cus_email: paymentData.cus_email,
        cus_phone: paymentData.cus_phone,
        cus_add1: paymentData.cus_add1,
        cus_city: paymentData.cus_city,
        cus_postcode: paymentData.cus_postcode,
        shipping_method: paymentData.shipping_method,
        num_of_item: String(paymentData.num_of_item),
        product_name: paymentData.product_name,
        product_category: paymentData.product_category,
      })

      const response = await fetch(`${this.getBaseUrl()}/gwprocess/v4/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      const data = await response.json()

      if (data.status === 'SUCCESS') {
        return data.GatewayPageURL
      }

      console.error('SSLCommerz error:', data)
      return null
    } catch (error) {
      console.error('SSLCommerz payment initiation error:', error)
      return null
    }
  }

  async validatePayment(tran_id: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        store_id: this.config.store_id,
        store_passwd: this.config.store_password,
        tran_id: tran_id,
        val_id: '0',
        format: 'json',
      })

      const response = await fetch(
        `${this.getBaseUrl()}/validator/api/merchantTransIDvalidationAPI.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      )

      const data = await response.json()
      return data.status === 'VALID' || data.status === 'VALIDATED'
    } catch (error) {
      console.error('SSLCommerz validation error:', error)
      return false
    }
  }
}

export const sslcommerz = new SSLCommerzService()
