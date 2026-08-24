/**
 * Cookie that identifies an anonymous voter across visits.
 * HttpOnly so client scripts cannot copy it; votes still work via same-origin fetch.
 */
export const VOTER_COOKIE = 'zenzei_voter'
