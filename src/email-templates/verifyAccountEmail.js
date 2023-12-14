module.exports = (token) => {

    let consumer_uri = process.env.CONSUMER_URI;

    return `<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
    
    <table align="center" style="border: none; border-collapse: collapse; margin: auto; display: block; width: 600px; table-layout: auto;">
        <tbody>
            <tr>
                <th>
                    <img src="https://sbs-form-frontend.vercel.app/logo.svg" style="margin: auto; display: block; width: 600px;">
                </th>
            </tr>
            <tr>
                <th style="padding-top: 40px;">
                    <span style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI'; font-size: 30px; color: rgb(6, 182, 212); font-weight: bold;">Welcome to SECURE BAILMENT SOLUTIONS</span>
                    <span style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI'; font-size: 24px; color: rgb(6, 182, 212); font-weight: bold;">Application Form - Compliance!</span>

                </th>
            </tr>
            <tr>
                <th style="padding-top: 5px;">
                    <span style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI'; font-size: 21px; color: rgb(6, 182, 212); font-weight: lighter;">We're excited to have you.</span>
                </th>
            </tr>
            <tr>
                <th style="padding-top: 40px; padding-bottom: 40px;">
                    <span style="padding-top: 15px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI'; font-size: 18px; color: rgb(6, 182, 212); font-weight: lighter;">We just need you to verify that this is the right email for you. <br/> If this is you, click below to verify your email address.</span>
                </th>
            </tr>
            <tr>
                <td>
                    <table border="0" cellspacing="0" cellpadding="0" align="center">
                        <tr>
                            <td align="center" style="padding: 14px; border-radius: 4px; background-color: rgb(6, 182, 212);">
                                    <a href="${consumer_uri}/verify-email/${token}" target="_blank" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI'; text-decoration: none; font-size: 20px; line-height: 16px; color: white; border-radius: 4px; overflow: visible; font-weight:bold; ">Verify Email</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <th style="padding-top: 35px;">
                    <span style="padding-top: 15px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI'; font-size: 15px; color: rgb(6, 182, 212); font-weight: lighter;">Button not working? Paste this link into your browser instead: <br/>${consumer_uri}/verify-email/${token}</span>
                </th>
            </tr>
            <tr>
                <th style="padding-top: 25px;">
                    <span style="padding-top: 15px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI'; font-size: 15px; color: rgb(6, 182, 212); font-weight: lighter;">Not you? Ignore this message or contact our support team at support@sbs.au with any questions</span>
                </th>
            </tr>
            <tr >
                <th style="padding-top: 75px;">
                    <span style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI'; font-size: 15px; color: rgb(6, 182, 212); font-weight: lighter;">© 2023, SBS. All rights reserved.</span>
                </th>
            </tr>
        </tbody>
    </table>
    </body>`
}