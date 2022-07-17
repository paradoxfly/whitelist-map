'reach 0.1';

const common = {
  ...hasRandom,
  checkBalance: Fun([Token], Null)
}
export const main = Reach.App(() => {
  setOptions({ untrustworthyMaps: true });
  const Deployer =  Participant('Deployer', {
    ...common,
    viewWhitelist: Fun([Address], Null),
    getTokenId: Fun([], Token)
  });
  const Attacher = ParticipantClass('Attacher', {
    ...common,
    submitAddress: Fun([], Null),
    whitelistSuccess: Fun([Bool], Null),
    acceptToken: Fun([Token], Null),
    timeout: Fun([], Null)
  });

  init();

  Deployer.only(() => {
    const token = declassify(interact.getTokenId());
  })
  Deployer.publish(token)
  commit();

  const initialTokenSupply = 50000000;
  const whitelistEarning = 10000000;
  Deployer.pay([[initialTokenSupply, token]]);
  const WHITELIST = new Set();
  

  var [numberWhitelisted] = [0];
  invariant(balance(token) === (initialTokenSupply - (numberWhitelisted * whitelistEarning)) );
  while(true){
    commit();

    Attacher.only(() => {
      interact.submitAddress();
      interact.acceptToken(token);
      const attacherAccountAddress = this;
    });
    Attacher.publish(attacherAccountAddress)
      .timeout(relativeTime(100), () => {
        Attacher.publish();
        Attacher.interact.timeout();
        [ numberWhitelisted ] = [ numberWhitelisted ];
        continue;
      });

    require(this === attacherAccountAddress);
    if( (numberWhitelisted<5) && (!WHITELIST.member(attacherAccountAddress)) ){
      WHITELIST.insert(attacherAccountAddress);
      transfer(whitelistEarning, token).to(attacherAccountAddress);
      Deployer.interact.viewWhitelist(attacherAccountAddress);
      Attacher.interact.whitelistSuccess(true);
      Attacher.interact.checkBalance(token);
      [ numberWhitelisted ] = [ numberWhitelisted + 1 ];
      continue;
    }
    else{
      Attacher.interact.whitelistSuccess(false);
      [ numberWhitelisted ] = [ numberWhitelisted ];
      continue;
    }
  }

  assert(balance(token) == 0);
  commit();
})