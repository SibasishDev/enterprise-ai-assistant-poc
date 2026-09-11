import {fetchAuthSession} from '@aws-amplify/auth';

export async function getAccessToken(){
    const session = await fetchAuthSession();
     
    return session.tokens?.accessToken?.toString();
}