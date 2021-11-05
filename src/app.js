App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: () => {
        return App.initWeb3();
    },

    initWeb3: async () => {

        // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        web3 = new Web3(window.ethereum);

        return App.initContracts();


        // if (window.ethereum === undefined) {
        //     alert('Please install metamask.');
        // } else {
        //     // if (window.ethereum) {
        //     //     App.web3Provider = window.ethereum;
        //     //     web3 = new Web3(window.ethereum);
        //     // } else if (window.web3) {
        //     //     App.web3Provider = window.ethereum;
        //     //     web3 = new Web3(window.ethereum);
        //     // } else {
        //     //     App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        //     //     web3 = new Web3(App.web3Provider);
        //     // }
        //     return App.initContracts();
        // }
    },

    initContracts: async () => {
        const id = await web3.eth.net.getId();
        accounts = await web3.eth.getAccounts();

        $.getJSON("Hello.json", (register) => {
            const deployedNetwork = register.networks[id];
            if (!deployedNetwork) {
                alert('Smart contract not found on this network. Please connect to binance test network.')
                return;
            }
            App.Hello = new web3.eth.Contract(
                register.abi,
                deployedNetwork && deployedNetwork.address);
        })

    },
    getvalue: async () => {
        var value = await App.Hello.methods.get().call();

        $('#getValue').html(value)

    },
    setValue: async () => {
        var value = $('#setValue').val();
        
        let privateKeys = await $.getJSON("./wallet-keys.json");

        let receipt;

        for (let i = 0; i < privateKeys.length; i++) {
            const account1 = web3.eth.accounts.privateKeyToAccount(privateKeys[i]);
            const transaction1 = App.Hello.methods.set(value);
            receipt = await send(account1, transaction1);
            console.log(receipt)
        }

    }

}

async function addTokenToWallet() {
    const tokenAddress = '0x6d9dd50D1F9CE2145E29118ebc75F9Dcd5206d32';
    const tokenSymbol = 'REW';
    const tokenDecimals = 18;

    try {
        await ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20', // Initially only supports ERC20, but eventually more!
                options: {
                    address: tokenAddress, // The address that the token is at.
                    symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                    decimals: tokenDecimals, // The number of decimals in the token
                },
            },
        });
    } catch (error) {
        console.log(error);
    }
}


async function send(account, transaction) {
    const options = {
        to: transaction._parent._address,
        data: transaction.encodeABI(),
        gas: 300000,
    };
    const signed = await web3.eth.accounts.signTransaction(options, account.privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
    return receipt;
}


$(function () {
    $(window).load(() => {
        App.init();
    })
})