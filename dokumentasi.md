
Public
ENVIRONMENT
No Environment
LAYOUT
Single Column
LANGUAGE
cURL - cURL
Lynk Webhook
Introduction
Webhook
Lynk Webhook
This allows merchants to receive real-time notifications about successful transactions and integrate this data into their own systems.

Webhook Authentication with Lynk.id
Authentication Flow
Lynk.id webhooks use a token-based authentication method to secure webhook payloads. Here's how to verify incoming webhook requests:

When you receive a webhook from Lynk.id, it will include a X-Lynk-Signature header

Use your merchant key to validate that the request is genuinely from Lynk.id

Verification Steps
Extract the X-Lynk-Signature from the request headers

Extract refId, amount(grandTotal), and message_id from the request body

Use your merchant key (obtained from your Lynk.id dashboard)

Process the webhook only if the signature is valid

Security Tips
Never share your merchant key with anyone

Always verify the signature before processing webhook data

Consider validating timestamps to prevent replay attacks

Store your merchant key securely in environment variables

*Note: merchant key will be available once you saved a webhook URL.

Code Example Python
python
import hashlib
def validate_lynk_signature(ref_id, amount, message_id, received_signature, secret_key):
    signature_string = amount + ref_id + message_id + secret_key
    calculated_signature = hashlib.sha256(signature_string.encode('utf-8')).hexdigest()
    return calculated_signature == received_signature
Code Example JavaScript (Node.js)
View More
javascript
const crypto = require('crypto');
function validateLynkSignature(ref_id, amount, message_id, receivedSignature, secretKey) {
  const signatureString = amount + ref_id + message_id + secretKey;
  const calculatedSignature = crypto
    .createHash('sha256')
    .update(signatureString)
    .digest('hex');
  return calculatedSignature === receivedSignature;
}
Code Example (Go)
View More
go
package main
import (
    "crypto/sha256"
    "encoding/hex"
)
func ValidateLynkSignature(refID, amount string, message_id string, receivedSignature, secretKey string) bool {
    signatureString := amount + refID + message_id + secretKey
    hash := sha256.New()
    hash.Write([]byte(signatureString))
    calculatedSignature := hex.EncodeToString(hash.Sum(nil))
    return calculatedSignature == receivedSignature
}
Webhook
About Webhook
Webhook provide a way for notifications to be delivered to an external web server whenever certain event occur in Lynk.

Request Method
The format prepared by the engine is ​JSON​. with Method use POST and application/json for Content-type.

Event Type
Message event webhooks can be triggered by several types of events:

Event Name	Description
payment.received	Event triggered after the customer makes a payment / has completed the payment
Event payment.received payload

payload that will be sent to the webhook server URL when there is a transaction

View More
json
{
    "event": "payment.received",
    "data": {
        "message_action": "SUCCESS",
        "message_code": "0",
        "message_data": {
            "createdAt": "2025-04-10T14:30:45",
            "customer": {
                "email": "user@lynk.id",
                "name": "Lynk User",
                "phone": "0812345677889"
            },
            "items": [
                {
                    "addons": [
                        {
                            "id": "67c6b9a5593dd002a0ec4ab7-5498-4703872927-1741076901767",
                            "name": "Iniprodukaddon",
                            "price": "50,000"
                        }
                    ],
                    "appointment_data": {},
                    "pafId": "",
                    "price": 25000,
                    "public_affiliate_content": {},
                    "qty": 1,
                    "stock": 1,
                    "title": "Digital Produk",
                    "uuid": "63cfd869524d15196a557388-8244-36439"
                }
            ],
            "refId": "13f8d23beeb2aacbbc01c94060cc88d7",
            "shippingAddress": "",
            "shippingInfo": "",
            "totals": {
                "affiliate": 0,
                "convenienceFee": -3000,
                "discount": 0,
                "grandTotal": 72000,
                "totalAddon": 50000,
                "totalItem": 1,
                "totalPrice": 25000,
                "totalShipping": 0
            }
        },
        "message_desc": "",
        "message_id": "API_CALL_1744270275143115_4624014",
        "message_title": ""
    }
}
Description of fields:

Root Level:

event: (String) The name of the event that triggered the webhook. In this case, it's "payment.received".

data: (Object) Contains the details of the payment received event.

data Object:

message_action: (String) Indicates the status of the message. Example: "SUCCESS".

message_code: (String) A code representing the message status. Example: "0".

message_data: (Object) Contains the actual data related to the payment.

message_desc: (String) A description of the message.

message_id: (String) A unique identifier for the message. Example: "API_CALL_1744270275143115_4624014".

message_title: (String) A title for the message.

message_data Object:

createdAt: (String) Timestamp indicating when the payment was recorded, in ISO 8601 format. Example: "2025-04-10T14:30:45".

customer: (Object) Contains customer information.

items: (Array of Objects) An array of items included in the payment.

refId: (String) A reference ID for the payment. Example: "13f8d23beeb2aacbbc01c94060cc88d7".

shippingAddress: (String) The shipping address associated with the payment.

shippingInfo: (String) Shipping information related to the payment.

totals: (Object) Contains a breakdown of the payment totals.

customer Object:

email: (String) The customer's email address. Example: "user@lynk.id".

name: (String) The customer's name. Example: "Lynk User".

phone: (String) The customer's phone number. Example: "0812345677889".

items Array (each object in the array):

addons: (Array of Objects) An array of addons associated with the item.

appointment_data: (Object) Data related to appointments, if applicable.

pafId: (String) Potentially an ID related to a public affiliate.

price: (Number) The price of the item. Example: 25000.

public_affiliate_content: (Object) Content related to public affiliates.

qty: (Number) The quantity of the item. Example: 1.

stock: (Number) The stock level of the item. Example: 1.

title: (String) The title of the item. Example: "Digital Produk".

uuid: (String) A unique identifier for the item. Example: "63cfd869524d15196a557388-8244-36439".

addons Array (each object in the array):

id: (String) The ID of the addon. Example: "67c6b9a5593dd002a0ec4ab7-5498-4703872927-1741076901767".

name: (String) The name of the addon. Example: "Iniprodukaddon".

price: (String) The price of the addon. Example: "50,000".

totals Object:

affiliate: (Number) The affiliate commission amount. Example: 0.

convenienceFee: (Number) The convenience fee amount. Example: -3000.

discount: (Number) The discount amount. Example: 0.

grandTotal: (Number) The final net amount that the seller receives after deducting fees. . Example: 72000.

totalAddon: (Number) The total amount for addons. Example: 50000.

totalItem: (Number) The total number of items. Example: 1.

totalPrice: (Number) The total price of the items (excluding addons, shipping, etc.). Example: 25000.

totalShipping: (Number) The total shipping cost. Example: 0.

Expected Response:

A successful response (200 OK) would typically indicate that the webhook was received and processed correctly by the merchant's system. The exact response body will depend on the merchant's implementation.

Error Handling:

The code includes basic error handling. If the response.status_code is not 200, the code logs the error message and candidate for a retry.

POST
Webhook POST
webhook_url
The webhook_url is dynamically obtained from the user data. You'll need to replace this with an actual URL for testing.

HEADERS
X-Lynk-Signature
Token

Body
raw (json)
View More
json
{
    "event": "payment.received",
    "data": {
        "message_action": "SUCCESS",
        "message_code": "0",
        "message_data": {
            "createdAt": "2025-04-10T14:30:45",
            "customer": {
                "email": "user@lynk.id",
                "name": "Lynk User",
                "phone": "0812345677889"
            },
            "items": [
                {
                    "addons": [
                        {
                            "id": "67c6b9a5593dd002a0ec4ab7-5498-4703872927-1741076901767",
                            "name": "Iniprodukaddon",
                            "price": "50,000"
                        }
                    ],
                    "appointment_data": {},
                    "pafId": "",
                    "price": 25000,
                    "public_affiliate_content": {},
                    "qty": 1,
                    "stock": 1,
                    "title": "Digital Produk",
                    "uuid": "63cfd869524d15196a557388-8244-36439"
                }
            ],
            "refId": "13f8d23beeb2aacbbc01c94060cc88d7",
            "shippingAddress": "",
            "shippingInfo": "",
            "totals": {
                "affiliate": 0,
                "convenienceFee": -3000,
                "discount": 0,
                "grandTotal": 72000,
                "totalAddon": 50000,
                "totalItem": 1,
                "totalPrice": 25000,
                "totalShipping": 0
            }
        },
        "message_desc": "",
        "message_id": "API_CALL_1744270275143115_4624014",
        "message_title": ""
    }
}
Example Request
Webhook POST
View More
curl
curl --location 'webhook_url' \
--header 'X-Lynk-Signature: Token' \
--data-raw '{
    "event": "payment.received",
    "data": {
        "message_action": "SUCCESS",
        "message_code": "0",
        "message_data": {
            "createdAt": "2025-04-10T14:30:45",
            "customer": {
                "email": "user@lynk.id",
                "name": "Lynk User",
                "phone": "0812345677889"
            },
            "items": [
                {
                    "addons": [
                        {
                            "id": "67c6b9a5593dd002a0ec4ab7-5498-4703872927-1741076901767",
                            "name": "Iniprodukaddon",
                            "price": "50,000"
                        }
                    ],
                    "appointment_data": {},
                    "pafId": "",
                    "price": 25000,
                    "public_affiliate_content": {},
                    "qty": 1,
                    "stock": 1,
                    "title": "Digital Produk",
                    "uuid": "63cfd869524d15196a557388-8244-36439"
                }
            ],
            "refId": "13f8d23beeb2aacbbc01c94060cc88d7",
            "shippingAddress": "",
            "shippingInfo": "",
            "totals": {
                "affiliate": 0,
                "convenienceFee": -3000,
                "discount": 0,
                "grandTotal": 72000,
                "totalAddon": 50000,
                "totalItem": 1,
                "totalPrice": 25000,
                "totalShipping": 0
            }
        },
        "message_desc": "",
        "message_id": "API_CALL_1744270275143115_4624014",
        "message_title": ""
    }
}'
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body