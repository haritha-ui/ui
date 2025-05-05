
/*
You can use token response type directly. This response type doesn't need to validate the returned token with
OIDC provider's JWKs.
if you want to use this configuration for production, then you'll have to use the production urls.
*/
export const authenticationTokenConfiguration = {
  authority: 'x',
  client_id: process.env.REACT_APP_SSO_CLIENT_ID, //Replace this property with your own client_id taken from provisioner tool
  redirect_uri: process.env.REACT_APP_SSO_REDIRECT_URI, //You can use this uri, but you have to add it in your w3id sso configuration, if you want to use a different one, you must replace it
  response_type: 'id_token token',
  scope: 'openid',
  loadUserInfo: false,
  metadata: {
    issuer: process.env.REACT_APP_OIDC_ISSUER, //Change for production url if you are planning to use it in a production environment.
    authorization_endpoint: process.env.REACT_APP_OIDC_AUTHORIZATION, //Change for production url if you are planning to use it in a production environment.
    jwks_uri: process.env.REACT_APP_OIDC_JWKS_ENDPOINT,
  },
  signingKeys: [
    {
      kty: 'RSA',
      kid: 'server',
      use: 'sig',
      alg: 'RS256',
      n:
        'yAe00C3CujXmYe5sSbSFDcyH6QboBqD7HHyrGCQEdHoi6r3lQghecOLlAvW_3rFmAS61OVStxlRAYEN32eQmRwSqSJwJ3889WvVFpDQsUxUyLVJbIDhwQBwLzfw2PD_NggT-_GO-_H_OPy_XS3DXxZWlYr0PXyo471dOT0v9ibhEyNidcmgss5qQlqgER2urfLIC39JMmg0wF7XhJmiei-hT23EMlN6v7niDi64Fr6mXd31YlBjmHvqY87HQr-0MB_KcNVq_avI-y9UnLSY2zIaz2b2mdW27u8gfARslTnriD32ZbQ3LWhzYz1hYIUZQkssgwLrUEB3u0t9x3RjrGw',
      e: 'AQAB',
      x5c: [
        'MIIDQDCCAigCCQCOYtzICIakAjANBgkqhkiG9w0BAQsFADBiMQswCQYDVQQGEwJVUzELMAkGA1UECAwCTlkxDzANBgNVBAcMBkFybW9uazEMMAoGA1UECgwDSUJNMQwwCgYDVQQLDANDSU8xGTAXBgNVBAMMEGxvZ2luLnczLmlibS5jb20wHhcNMTkxMDEwMTQxNDI2WhcNMjQxMDA4MTQxNDI2WjBiMQswCQYDVQQGEwJVUzELMAkGA1UECAwCTlkxDzANBgNVBAcMBkFybW9uazEMMAoGA1UECgwDSUJNMQwwCgYDVQQLDANDSU8xGTAXBgNVBAMMEGxvZ2luLnczLmlibS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDIB7TQLcK6NeZh7mxJtIUNzIfpBugGoPscfKsYJAR0eiLqveVCCF5w4uUC9b/esWYBLrU5VK3GVEBgQ3fZ5CZHBKpInAnfzz1a9UWkNCxTFTItUlsgOHBAHAvN/DY8P82CBP78Y778f84/L9dLcNfFlaVivQ9fKjjvV05PS/2JuETI2J1yaCyzmpCWqARHa6t8sgLf0kyaDTAXteEmaJ6L6FPbcQyU3q/ueIOLrgWvqZd3fViUGOYe+pjzsdCv7QwH8pw1Wr9q8j7L1SctJjbMhrPZvaZ1bbu7yB8BGyVOeuIPfZltDctaHNjPWFghRlCSyyDAutQQHe7S33HdGOsbAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAEfwlRgbIC8XFnKi/MQlftJSwgXaMwcaOqySrS4Grt4FiYTm0KvMJFvZgJtyy0u1wRy4uzn1SHuNAcqzFCq28N5r1HmkPIAezxxSENUakiGNmTHN/JT+HLpzV8krRJrkQDCMP0ic3h77IfBGlGz/OnEsSyMMlXcGvSlGbWb0MGjv77b52jz0usVXFYwZctFvBO2Ls3XoBPxnl9ZXZZf/zFaIAkabGkr+LO2kZqu8ujq769HksGFDmiREGUhOAqNElnaeIOnKoXRhVIMpfrAWdkw8wuz8p/omCeU+VkeK6v4uSIe86b8ifAujHiVKSnN7drRGadRsoltsF6QI4f5FcpA=',
      ],
      'x5t#S256': 'jCmjYlYEgXlKziEu22XzA9WuCvcoseFVXSIK-__sEuw',
    },
    {
      kty: 'RSA',
      kid: 'oidc-signing-cert',
      use: 'sig',
      alg: 'RS256',
      n:
        'zW3YYA3mYNH5jgVF0We97sWro4GIZNBJ0Rynmo0sy-wkC64ViyjLL_tNHkzCIlXk7_zW_UpkHpaccF-uYNLrwEIverkjwzxHBOKnOoWXtzBZMyq1-kln9Tfnl5iZGAFw6EdNuDDf44nx0aZqXqqgoclGiAdJ__kPu7ZTda2UO2ZT1U7rmhq5MA6gSA_s5TCsjWkmRv97ebGF-41a7SEbknrdv9fb6Nem9G2FbykaZo904QBSAiOmoDtt0Y4CZpNP_zEMry8H2r-jaw7xRikgfUD6KdY5eEZrqjscVon2MgvgfSC9uGYX-5PbzVg2gbd2fNtF-UxM1khed3Xy3QsoFQ',
      e: 'AQAB',
      x5c: [
        'MIIDQDCCAigCCQDQETWSfZeiBzANBgkqhkiG9w0BAQsFADBiMQswCQYDVQQGEwJVUzELMAkGA1UECAwCTlkxDzANBgNVBAcMBkFybW9uazEMMAoGA1UECgwDSUJNMQwwCgYDVQQLDANDSU8xGTAXBgNVBAMMEGxvZ2luLnczLmlibS5jb20wHhcNMTkxMDEwMTQxMzQwWhcNMjMxMDA5MTQxMzQwWjBiMQswCQYDVQQGEwJVUzELMAkGA1UECAwCTlkxDzANBgNVBAcMBkFybW9uazEMMAoGA1UECgwDSUJNMQwwCgYDVQQLDANDSU8xGTAXBgNVBAMMEGxvZ2luLnczLmlibS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDNbdhgDeZg0fmOBUXRZ73uxaujgYhk0EnRHKeajSzL7CQLrhWLKMsv+00eTMIiVeTv/Nb9SmQelpxwX65g0uvAQi96uSPDPEcE4qc6hZe3MFkzKrX6SWf1N+eXmJkYAXDoR024MN/jifHRpmpeqqChyUaIB0n/+Q+7tlN1rZQ7ZlPVTuuaGrkwDqBID+zlMKyNaSZG/3t5sYX7jVrtIRuSet2/19vo16b0bYVvKRpmj3ThAFICI6agO23RjgJmk0//MQyvLwfav6NrDvFGKSB9QPop1jl4RmuqOxxWifYyC+B9IL24Zhf7k9vNWDaBt3Z820X5TEzWSF53dfLdCygVAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAFCOLW3geDsoUKOqx2z5JsMPDj5P+Wqo9kjTCZxtJjlFLBqMcJ1H/DlsHxvAcBlffUg09mdEGlPio6fSGGrIjkSG3crdeffK9ciHKNGWYT3f+AoP+ZBDlCFid9DB6PjfgAiHKCTKGK7rV5rKc79cCbDDbQxxMMQ/5DwSBJTcuQiOZpixswvPmTxkdnSxbjNc9PJuD5f8PIYzDMs2sXP//Sts4WjxUYRsDF1FcL1Wsw6icnUOD/zbKN3wCBniBmqr0jR5pyMiD9f9SPu8V7w5/ObrrTe8YSzVZsqbKXV6IwLt5zWspeEFsx8veXXJIJDC2/ACQtMXp/xV4D6S8E1Zizw=',
      ],
      'x5t#S256': '01OcACXwDxRO420lM_75jShMBoCBEc171VWOomDSZos',
    },
    {
      kty: "RSA",
      kid: "oidc-signing-cert-2023",
      use: "sig",
      n: "x33H_TF_Nx0aKjdPXPaX-q93wgKvirPuoBx6Oujtf6Ev6LBY4XWAnmGWyJKCGY8BbdFoNW1WNVvczvQEqfKfNQZvgQxoRldjt2ADyVZAYG5wRez2Wbbk36RcriysyejYXGReS1H8ImxXqiJ_y-S8aV5jCC0nH0VRWUXTzwEFx_2tnI54Avv8gD_UgmNFYWg5XPv0AUxpQt-PCOlrmjD4EU7HNNXI4BfoU-7EbBvss1DxKo1OhOlXz0xFNbsPMUDjfIlIkWPJb7iI3OjTLzn7VFz6JeRQjVn6Wc_FdMs1tnzOdt97Bus1RAgGVkELpAsGcTwi4-Z9SwQ9NdKLgwyOsw",
      e: "AQAB",
      x5c: [
        "MIIFYTCCBEmgAwIBAgIQAhgY076dI6JQXG39U6vRrjANBgkqhkiG9w0BAQsFADBqMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3d3cuZGlnaWNlcnQuY29tMSkwJwYDVQQDEyBEaWdpQ2VydCBBc3N1cmVkIElEIENsaWVudCBDQSBHMjAeFw0yMzA4MzAwMDAwMDBaFw0yNjA4MzAyMzU5NTlaMIGCMQswCQYDVQQGEwJVUzERMA8GA1UECBMITmV3IFlvcmsxDzANBgNVBAcTBkFybW9uazE0MDIGA1UEChMrSW50ZXJuYXRpb25hbCBCdXNpbmVzcyBNYWNoaW5lcyBDb3Jwb3JhdGlvbjEZMBcGA1UEAxMQbG9naW4udzMuaWJtLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMd9x/0xfzcdGio3T1z2l/qvd8ICr4qz7qAcejro7X+hL+iwWOF1gJ5hlsiSghmPAW3RaDVtVjVb3M70BKnynzUGb4EMaEZXY7dgA8lWQGBucEXs9lm25N+kXK4srMno2FxkXktR/CJsV6oif8vkvGleYwgtJx9FUVlF088BBcf9rZyOeAL7/IA/1IJjRWFoOVz79AFMaULfjwjpa5ow+BFOxzTVyOAX6FPuxGwb7LNQ8SqNToTpV89MRTW7DzFA43yJSJFjyW+4iNzo0y85+1Rc+iXkUI1Z+lnPxXTLNbZ8znbfewbrNUQIBlZBC6QLBnE8IuPmfUsEPTXSi4MMjrMCAwEAAaOCAegwggHkMB8GA1UdIwQYMBaAFKViIFDcu1tXl60jjzXiVGypfvlOMB0GA1UdDgQWBBTlPJXuF0P2C13/lG2Be2Qou4WMBTAhBgNVHREEGjAYgRZlZC5rbGVub3RpekB1cy5pYm0uY29tMA4GA1UdDwEB/wQEAwIGwDAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwQwQwYDVR0gBDwwOjA4BgpghkgBhv1sBAECMCowKAYIKwYBBQUHAgEWHGh0dHBzOi8vd3d3LmRpZ2ljZXJ0LmNvbS9DUFMwgYsGA1UdHwSBgzCBgDA+oDygOoY4aHR0cDovL2NybDMuZGlnaWNlcnQuY29tL0RpZ2lDZXJ0QXNzdXJlZElEQ2xpZW50Q0FHMi5jcmwwPqA8oDqGOGh0dHA6Ly9jcmw0LmRpZ2ljZXJ0LmNvbS9EaWdpQ2VydEFzc3VyZWRJRENsaWVudENBRzIuY3JsMH0GCCsGAQUFBwEBBHEwbzAkBggrBgEFBQcwAYYYaHR0cDovL29jc3AuZGlnaWNlcnQuY29tMEcGCCsGAQUFBzAChjtodHRwOi8vY2FjZXJ0cy5kaWdpY2VydC5jb20vRGlnaUNlcnRBc3N1cmVkSURDbGllbnRDQUcyLmNydDANBgkqhkiG9w0BAQsFAAOCAQEAqkYkoaKlQlPShcnuOzZ9/wOnF5+Ge3xDMm8KBrQ0BtFLW2uh4O9APaMHoQc/VJQR5I49on/qVENQsVPQKuMA0KiZDMCRIpUaXl/zpKA70gVRkkgA+s2SXnbq3SwWEtIaO/MNV8q2BzK0D1KMM5Z5VqVVGo9nKYCtCp/Sq+oZf3TwS8cHRD37IhjRcgiPXbV/uaRhwHC/Gn2/wArRDDi/ErbOlbEFFjpQNrN8i1vZoRPghJ1IZTxXtdbq+l1AKmAj7MbgIp7WOYnBP/1EFcP7KybzjNg9CrPlewtIkUGaqiHc+30V+UuSumtEV7JjTRytWNHCKPFSJdzTp1e7Q/s/tQ=="
      ],
      "x5t#S256": "cImRq3b8VJjgOGPkSR56hmmRrwkW54b7T9WicQ5zl7w",
    },
  ],
};

/*
If you prefer to use id_token response type instead of token, you have to add an extra configuration:
You must add a property called signingKeys, this porperty must include the JWKs information found at
https://preprod.login.w3.ibm.com/oidc/endpoint/default/jwks as shown in the following configuration. if you want 
to use this configurations for production, then you'll have to use the production urls.
*/
export const authenticationIdTokenConfiguration = {
  authority: 'x',
  client_id: process.env.REACT_APP_SSO_CLIENT_ID, //Replace this property with your own client_id taken from provisioner tool
  redirect_uri: process.env.REACT_APP_SSO_REDIRECT_URI, //You can use this uri, but you have to add it in your w3id sso configuration, if you want to use a different one, you must replace it
  response_type: 'id_token token',
  scope: 'openid',
  loadUserInfo: true,
  metadata: {
    issuer: process.env.REACT_APP_OIDC_ISSUER, //Change for production url if you are planning to use it in a production environment.
    authorization_endpoint: process.env.REACT_APP_OIDC_AUTHORIZATION, //Change for production url if you are planning to use it in a production environment.
    jwks_uri: process.env.REACT_APP_OIDC_JWKS_ENDPOINT,
  },
  //Production keys.
  signingKeys: [
    {
      kty: 'RSA',
      kid: 'server',
      use: 'sig',
      alg: 'RS256',
      n:
        'yAe00C3CujXmYe5sSbSFDcyH6QboBqD7HHyrGCQEdHoi6r3lQghecOLlAvW_3rFmAS61OVStxlRAYEN32eQmRwSqSJwJ3889WvVFpDQsUxUyLVJbIDhwQBwLzfw2PD_NggT-_GO-_H_OPy_XS3DXxZWlYr0PXyo471dOT0v9ibhEyNidcmgss5qQlqgER2urfLIC39JMmg0wF7XhJmiei-hT23EMlN6v7niDi64Fr6mXd31YlBjmHvqY87HQr-0MB_KcNVq_avI-y9UnLSY2zIaz2b2mdW27u8gfARslTnriD32ZbQ3LWhzYz1hYIUZQkssgwLrUEB3u0t9x3RjrGw',
      e: 'AQAB',
      x5c: [
        'MIIDQDCCAigCCQCOYtzICIakAjANBgkqhkiG9w0BAQsFADBiMQswCQYDVQQGEwJVUzELMAkGA1UECAwCTlkxDzANBgNVBAcMBkFybW9uazEMMAoGA1UECgwDSUJNMQwwCgYDVQQLDANDSU8xGTAXBgNVBAMMEGxvZ2luLnczLmlibS5jb20wHhcNMTkxMDEwMTQxNDI2WhcNMjQxMDA4MTQxNDI2WjBiMQswCQYDVQQGEwJVUzELMAkGA1UECAwCTlkxDzANBgNVBAcMBkFybW9uazEMMAoGA1UECgwDSUJNMQwwCgYDVQQLDANDSU8xGTAXBgNVBAMMEGxvZ2luLnczLmlibS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDIB7TQLcK6NeZh7mxJtIUNzIfpBugGoPscfKsYJAR0eiLqveVCCF5w4uUC9b/esWYBLrU5VK3GVEBgQ3fZ5CZHBKpInAnfzz1a9UWkNCxTFTItUlsgOHBAHAvN/DY8P82CBP78Y778f84/L9dLcNfFlaVivQ9fKjjvV05PS/2JuETI2J1yaCyzmpCWqARHa6t8sgLf0kyaDTAXteEmaJ6L6FPbcQyU3q/ueIOLrgWvqZd3fViUGOYe+pjzsdCv7QwH8pw1Wr9q8j7L1SctJjbMhrPZvaZ1bbu7yB8BGyVOeuIPfZltDctaHNjPWFghRlCSyyDAutQQHe7S33HdGOsbAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAEfwlRgbIC8XFnKi/MQlftJSwgXaMwcaOqySrS4Grt4FiYTm0KvMJFvZgJtyy0u1wRy4uzn1SHuNAcqzFCq28N5r1HmkPIAezxxSENUakiGNmTHN/JT+HLpzV8krRJrkQDCMP0ic3h77IfBGlGz/OnEsSyMMlXcGvSlGbWb0MGjv77b52jz0usVXFYwZctFvBO2Ls3XoBPxnl9ZXZZf/zFaIAkabGkr+LO2kZqu8ujq769HksGFDmiREGUhOAqNElnaeIOnKoXRhVIMpfrAWdkw8wuz8p/omCeU+VkeK6v4uSIe86b8ifAujHiVKSnN7drRGadRsoltsF6QI4f5FcpA=',
      ],
      'x5t#S256': 'jCmjYlYEgXlKziEu22XzA9WuCvcoseFVXSIK-__sEuw',
    },
    {
      kty: 'RSA',
      kid: 'oidc-signing-cert',
      use: 'sig',
      alg: 'RS256',
      n:
        'zW3YYA3mYNH5jgVF0We97sWro4GIZNBJ0Rynmo0sy-wkC64ViyjLL_tNHkzCIlXk7_zW_UpkHpaccF-uYNLrwEIverkjwzxHBOKnOoWXtzBZMyq1-kln9Tfnl5iZGAFw6EdNuDDf44nx0aZqXqqgoclGiAdJ__kPu7ZTda2UO2ZT1U7rmhq5MA6gSA_s5TCsjWkmRv97ebGF-41a7SEbknrdv9fb6Nem9G2FbykaZo904QBSAiOmoDtt0Y4CZpNP_zEMry8H2r-jaw7xRikgfUD6KdY5eEZrqjscVon2MgvgfSC9uGYX-5PbzVg2gbd2fNtF-UxM1khed3Xy3QsoFQ',
      e: 'AQAB',
      x5c: [
        'MIIDQDCCAigCCQDQETWSfZeiBzANBgkqhkiG9w0BAQsFADBiMQswCQYDVQQGEwJVUzELMAkGA1UECAwCTlkxDzANBgNVBAcMBkFybW9uazEMMAoGA1UECgwDSUJNMQwwCgYDVQQLDANDSU8xGTAXBgNVBAMMEGxvZ2luLnczLmlibS5jb20wHhcNMTkxMDEwMTQxMzQwWhcNMjMxMDA5MTQxMzQwWjBiMQswCQYDVQQGEwJVUzELMAkGA1UECAwCTlkxDzANBgNVBAcMBkFybW9uazEMMAoGA1UECgwDSUJNMQwwCgYDVQQLDANDSU8xGTAXBgNVBAMMEGxvZ2luLnczLmlibS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDNbdhgDeZg0fmOBUXRZ73uxaujgYhk0EnRHKeajSzL7CQLrhWLKMsv+00eTMIiVeTv/Nb9SmQelpxwX65g0uvAQi96uSPDPEcE4qc6hZe3MFkzKrX6SWf1N+eXmJkYAXDoR024MN/jifHRpmpeqqChyUaIB0n/+Q+7tlN1rZQ7ZlPVTuuaGrkwDqBID+zlMKyNaSZG/3t5sYX7jVrtIRuSet2/19vo16b0bYVvKRpmj3ThAFICI6agO23RjgJmk0//MQyvLwfav6NrDvFGKSB9QPop1jl4RmuqOxxWifYyC+B9IL24Zhf7k9vNWDaBt3Z820X5TEzWSF53dfLdCygVAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAFCOLW3geDsoUKOqx2z5JsMPDj5P+Wqo9kjTCZxtJjlFLBqMcJ1H/DlsHxvAcBlffUg09mdEGlPio6fSGGrIjkSG3crdeffK9ciHKNGWYT3f+AoP+ZBDlCFid9DB6PjfgAiHKCTKGK7rV5rKc79cCbDDbQxxMMQ/5DwSBJTcuQiOZpixswvPmTxkdnSxbjNc9PJuD5f8PIYzDMs2sXP//Sts4WjxUYRsDF1FcL1Wsw6icnUOD/zbKN3wCBniBmqr0jR5pyMiD9f9SPu8V7w5/ObrrTe8YSzVZsqbKXV6IwLt5zWspeEFsx8veXXJIJDC2/ACQtMXp/xV4D6S8E1Zizw=',
      ],
      'x5t#S256': '01OcACXwDxRO420lM_75jShMBoCBEc171VWOomDSZos',
    },
    {
      kty: "RSA",
      kid: "oidc-signing-cert-2023",
      use: "sig",
      n: "x33H_TF_Nx0aKjdPXPaX-q93wgKvirPuoBx6Oujtf6Ev6LBY4XWAnmGWyJKCGY8BbdFoNW1WNVvczvQEqfKfNQZvgQxoRldjt2ADyVZAYG5wRez2Wbbk36RcriysyejYXGReS1H8ImxXqiJ_y-S8aV5jCC0nH0VRWUXTzwEFx_2tnI54Avv8gD_UgmNFYWg5XPv0AUxpQt-PCOlrmjD4EU7HNNXI4BfoU-7EbBvss1DxKo1OhOlXz0xFNbsPMUDjfIlIkWPJb7iI3OjTLzn7VFz6JeRQjVn6Wc_FdMs1tnzOdt97Bus1RAgGVkELpAsGcTwi4-Z9SwQ9NdKLgwyOsw",
      e: "AQAB",
      x5c: [
        "MIIFYTCCBEmgAwIBAgIQAhgY076dI6JQXG39U6vRrjANBgkqhkiG9w0BAQsFADBqMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3d3cuZGlnaWNlcnQuY29tMSkwJwYDVQQDEyBEaWdpQ2VydCBBc3N1cmVkIElEIENsaWVudCBDQSBHMjAeFw0yMzA4MzAwMDAwMDBaFw0yNjA4MzAyMzU5NTlaMIGCMQswCQYDVQQGEwJVUzERMA8GA1UECBMITmV3IFlvcmsxDzANBgNVBAcTBkFybW9uazE0MDIGA1UEChMrSW50ZXJuYXRpb25hbCBCdXNpbmVzcyBNYWNoaW5lcyBDb3Jwb3JhdGlvbjEZMBcGA1UEAxMQbG9naW4udzMuaWJtLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMd9x/0xfzcdGio3T1z2l/qvd8ICr4qz7qAcejro7X+hL+iwWOF1gJ5hlsiSghmPAW3RaDVtVjVb3M70BKnynzUGb4EMaEZXY7dgA8lWQGBucEXs9lm25N+kXK4srMno2FxkXktR/CJsV6oif8vkvGleYwgtJx9FUVlF088BBcf9rZyOeAL7/IA/1IJjRWFoOVz79AFMaULfjwjpa5ow+BFOxzTVyOAX6FPuxGwb7LNQ8SqNToTpV89MRTW7DzFA43yJSJFjyW+4iNzo0y85+1Rc+iXkUI1Z+lnPxXTLNbZ8znbfewbrNUQIBlZBC6QLBnE8IuPmfUsEPTXSi4MMjrMCAwEAAaOCAegwggHkMB8GA1UdIwQYMBaAFKViIFDcu1tXl60jjzXiVGypfvlOMB0GA1UdDgQWBBTlPJXuF0P2C13/lG2Be2Qou4WMBTAhBgNVHREEGjAYgRZlZC5rbGVub3RpekB1cy5pYm0uY29tMA4GA1UdDwEB/wQEAwIGwDAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwQwQwYDVR0gBDwwOjA4BgpghkgBhv1sBAECMCowKAYIKwYBBQUHAgEWHGh0dHBzOi8vd3d3LmRpZ2ljZXJ0LmNvbS9DUFMwgYsGA1UdHwSBgzCBgDA+oDygOoY4aHR0cDovL2NybDMuZGlnaWNlcnQuY29tL0RpZ2lDZXJ0QXNzdXJlZElEQ2xpZW50Q0FHMi5jcmwwPqA8oDqGOGh0dHA6Ly9jcmw0LmRpZ2ljZXJ0LmNvbS9EaWdpQ2VydEFzc3VyZWRJRENsaWVudENBRzIuY3JsMH0GCCsGAQUFBwEBBHEwbzAkBggrBgEFBQcwAYYYaHR0cDovL29jc3AuZGlnaWNlcnQuY29tMEcGCCsGAQUFBzAChjtodHRwOi8vY2FjZXJ0cy5kaWdpY2VydC5jb20vRGlnaUNlcnRBc3N1cmVkSURDbGllbnRDQUcyLmNydDANBgkqhkiG9w0BAQsFAAOCAQEAqkYkoaKlQlPShcnuOzZ9/wOnF5+Ge3xDMm8KBrQ0BtFLW2uh4O9APaMHoQc/VJQR5I49on/qVENQsVPQKuMA0KiZDMCRIpUaXl/zpKA70gVRkkgA+s2SXnbq3SwWEtIaO/MNV8q2BzK0D1KMM5Z5VqVVGo9nKYCtCp/Sq+oZf3TwS8cHRD37IhjRcgiPXbV/uaRhwHC/Gn2/wArRDDi/ErbOlbEFFjpQNrN8i1vZoRPghJ1IZTxXtdbq+l1AKmAj7MbgIp7WOYnBP/1EFcP7KybzjNg9CrPlewtIkUGaqiHc+30V+UuSumtEV7JjTRytWNHCKPFSJdzTp1e7Q/s/tQ=="
      ],
      "x5t#S256": "cImRq3b8VJjgOGPkSR56hmmRrwkW54b7T9WicQ5zl7w",
    },
  ],
};
