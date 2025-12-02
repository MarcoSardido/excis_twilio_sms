import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: 'https://keycloak.exc1s.com',
  realm: 'master',
  clientId: 'twilio-sms-web',
});

export default keycloak;
