export function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  const cookiesArray = cookieHeader.split(";");
  cookiesArray.forEach((cookie) => {
    const [key, ...valueParts] = cookie.split("=");
    const keyTrimmed = key.trim();
    const value = valueParts.join("=").trim();
    cookies[keyTrimmed] = decodeURIComponent(value);
  });

  return cookies;
}

// Example usage
const cookieHeader =
  "authjs.csrf-token=c2a22b08284172947316110326356349147f5bf6013842f647d0acf4e9a1ddd1%7Cf021f3514d950a3bdb2ebd43705053bb89ae310bd1f02442d99221741d3489ed; authjs.callback-url=http%3A%2F%2Flocalhost%3A3000; authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoibVdSY0VXZGVBN3BpUUFzcFN4NXQyT2N6VHZiOFF6LVBxeW8xZ1IzS3l1RkcwYnRORnJQVVUxRzBLakRZUVlpeG41bmxCMVU0TFBiaFNoVld4RXNWLXcifQ..TIqEFzbK0KAwrPgasrHd-A.r9-xHqLHWflP9-gmLmk122YCZ7KlolLfwDHg_kZq6mQiOOt5jpmSU7KIaEnkjeG4XwDHDic-M75-Lm0M7rJvX11RrXWjGdLhINBPY-AbiU-SoYaiJQZgcEp-RWjDO-YLWR7qM6wcYZAHRfKyttEM0westIh1LVoVAqXTe1sbl5Pu9I-QCS1qxG5ICOjxj3hKIAc0YTCn069LeB9PZPh47Jq2aOgEgUlnpaimiWilvHHGU1VbAUmATVSzfiH-V9uzbjQf-sy36HEZ0LhSXs0P2cYeKg8hbAyLNO2oQbtdlFkWlaNdY9zzQSGzOFH-KFBipEojwT_MCAd4j3AaA2wgDQin5RFBUwbkqozO2slmpxDE83QU3KUYRtgeO1c6qICW_R7S45Uxq2STC_tdhpxbDQ.yNb4tXlMwN7glMz3IQ4X7okOfEPGaUSgI1WYMwWVKiM";

const cookies = parseCookies(cookieHeader);

console.log(cookies);
// Output:
// {
//   'authjs.csrf-token': 'c2a22b08284172947316110326356349147f5bf6013842f647d0acf4e9a1ddd1|f021f3514d950a3bdb2ebd43705053bb89ae310bd1f02442d99221741d3489ed',
//   'authjs.callback-url': 'http://localhost:3000',
//   'authjs.session-token': 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoibVdSY0VXZGVBN3BpUUFzcFN4NXQyT2N6VHZiOFF6LVBxeW8xZ1IzS3l1RkcwYnRORnJQVVUxRzBLakRZUVlpeG41bmxCMVU0TFBiaFNoVld4RXNWLXcifQ..TIqEFzbK0KAwrPgasrHd-A.r9-xHqLHWflP9-gmLmk122YCZ7KlolLfwDHg_kZq6mQiOOt5jpmSU7KIaEnkjeG4XwDHDic-M75-Lm0M7rJvX11RrXWjGdLhINBPY-AbiU-SoYaiJQZgcEp-RWjDO-YLWR7qM6wcYZAHRfKyttEM0westIh1LVoVAqXTe1sbl5Pu9I-QCS1qxG5ICOjxj3hKIAc0YTCn069LeB9PZPh47Jq2aOgEgUlnpaimiWilvHHGU1VbAUmATVSzfiH-V9uzbjQf-sy36HEZ0LhSXs0P2cYeKg8hbAyLNO2oQbtdlFkWlaNdY9zzQSGzOFH-KFBipEojwT_MCAd4j3AaA2wgDQin5RFBUwbkqozO2slmpxDE83QU3KUYRtgeO1c6qICW_R7S45Uxq2STC_tdhpxbDQ.yNb4tXlMwN7glMz3IQ4X7okOfEPGaUSgI1WYMwWVKiM'
// }
