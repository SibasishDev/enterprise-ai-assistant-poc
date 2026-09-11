import { CognitoJwtVerifier } from "aws-jwt-verify";

import { env } from "./env";

export const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: env.COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: env.COGNITO_CLIENT_ID,
});
