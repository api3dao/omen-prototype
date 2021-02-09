module.exports = async ({ getUnnamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const accounts = await getUnnamedAccounts();

  const exampleClient = await deploy('ExampleClient', {
    args: ['0x32D228B5d44Fd18FefBfd68BfE5A5F3f75C873AE'],
    from: accounts[0],
  });
  log(`Deployed ExampleClient at ${exampleClient.address}`);
};
