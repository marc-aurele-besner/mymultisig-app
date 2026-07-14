"use strict";(self.webpackChunkmymultisig_app=self.webpackChunkmymultisig_app||[]).push([[8598],{"./node_modules/@reown/appkit-scaffold-ui/dist/esm/exports/w3m-modal.js"(__unused_webpack_module,__webpack_exports__,__webpack_require__){__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{AppKitModal:()=>AppKitModal,W3mListWallet:()=>W3mListWallet,W3mModal:()=>W3mModal,W3mModalBase:()=>W3mModalBase,W3mRouterContainer:()=>W3mRouterContainer,W3mUsageExceededView:()=>W3mUsageExceededView});var lit=__webpack_require__("./node_modules/lit/index.js"),decorators=__webpack_require__("./node_modules/lit/decorators.js"),if_defined=__webpack_require__("./node_modules/lit/directives/if-defined.js"),OptionsController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/OptionsController.js"),ModalController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/ModalController.js"),ChainController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/ChainController.js"),ConnectorController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/ConnectorController.js"),ApiController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/ApiController.js"),RouterController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/RouterController.js"),ConnectionController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/ConnectionController.js"),SIWXUtil=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/utils/SIWXUtil.js");const ModalUtil={isUnsupportedChainView:()=>"UnsupportedChain"===RouterController.I.state.view||"SwitchNetwork"===RouterController.I.state.view&&RouterController.I.state.history.includes("UnsupportedChain"),async safeClose(){if(this.isUnsupportedChainView())return void ModalController.W.shake();await SIWXUtil.U.isSIWXCloseDisabled()?ModalController.W.shake():("DataCapture"!==RouterController.I.state.view&&"DataCaptureOtpConfirm"!==RouterController.I.state.view||ConnectionController.x.disconnect(),ModalController.W.close())}};var ThemeController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/ThemeController.js"),SnackController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/SnackController.js"),vanilla=__webpack_require__("./node_modules/valtio/esm/vanilla.mjs"),utils=__webpack_require__("./node_modules/valtio/esm/vanilla/utils.mjs"),NumberUtil=__webpack_require__("./node_modules/@reown/appkit-common/dist/esm/src/utils/NumberUtil.js"),ConstantsUtil=__webpack_require__("./node_modules/@reown/appkit-common/dist/esm/src/utils/ConstantsUtil.js"),W3mFrameConstants=__webpack_require__("./node_modules/@reown/appkit-wallet/dist/esm/src/W3mFrameConstants.js"),BalanceUtil=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/utils/BalanceUtil.js"),ChainControllerUtil=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/utils/ChainControllerUtil.js"),utils_ConstantsUtil=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/utils/ConstantsUtil.js"),CoreHelperUtil=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/utils/CoreHelperUtil.js"),SwapApiUtil=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/utils/SwapApiUtil.js");const SwapCalculationUtil={getGasPriceInEther:(gas,gasPrice)=>Number(gasPrice*gas)/1e18,getGasPriceInUSD(networkPrice,gas,gasPrice){const totalGasCostInEther=SwapCalculationUtil.getGasPriceInEther(gas,gasPrice);return NumberUtil.S.bigNumber(networkPrice).times(totalGasCostInEther).toNumber()},getPriceImpact({sourceTokenAmount,sourceTokenPriceInUSD,toTokenPriceInUSD,toTokenAmount}){const inputValue=NumberUtil.S.bigNumber(sourceTokenAmount).times(sourceTokenPriceInUSD),outputValue=NumberUtil.S.bigNumber(toTokenAmount).times(toTokenPriceInUSD);return inputValue.minus(outputValue).div(inputValue).times(100).toNumber()},getMaxSlippage(slippage,toTokenAmount){const slippageToleranceDecimal=NumberUtil.S.bigNumber(slippage).div(100);return NumberUtil.S.multiply(toTokenAmount,slippageToleranceDecimal).toNumber()},getProviderFee:(sourceTokenAmount,feePercentage=.0085)=>NumberUtil.S.bigNumber(sourceTokenAmount).times(feePercentage).toString(),isInsufficientNetworkTokenForGas(networkBalanceInUSD,gasPriceInUSD){const gasPrice=gasPriceInUSD||"0";return!!NumberUtil.S.bigNumber(networkBalanceInUSD).eq(0)||NumberUtil.S.bigNumber(NumberUtil.S.bigNumber(gasPrice)).gt(networkBalanceInUSD)},isInsufficientSourceTokenForSwap(sourceTokenAmount,sourceTokenAddress,balance){const sourceTokenBalance=balance?.find(token=>token.address===sourceTokenAddress)?.quantity?.numeric;return NumberUtil.S.bigNumber(sourceTokenBalance||"0").lt(sourceTokenAmount)}};var withErrorBoundary=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/utils/withErrorBoundary.js"),AlertController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/AlertController.js"),BlockchainApiController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/BlockchainApiController.js"),EventsController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/EventsController.js");Error;const initialState={initializing:!1,initialized:!1,loadingPrices:!1,loadingQuote:!1,loadingApprovalTransaction:!1,loadingBuildTransaction:!1,loadingTransaction:!1,switchingTokens:!1,fetchError:!1,approvalTransaction:void 0,swapTransaction:void 0,transactionError:void 0,sourceToken:void 0,sourceTokenAmount:"",sourceTokenPriceInUSD:0,toToken:void 0,toTokenAmount:"",toTokenPriceInUSD:0,networkPrice:"0",networkBalanceInUSD:"0",networkTokenSymbol:"",inputError:void 0,slippage:utils_ConstantsUtil.oU.CONVERT_SLIPPAGE_TOLERANCE,tokens:void 0,popularTokens:void 0,suggestedTokens:void 0,foundTokens:void 0,myTokensWithBalance:void 0,tokensPriceMap:{},gasFee:"0",gasPriceInUSD:0,priceImpact:void 0,maxSlippage:void 0,providerFee:void 0},state=(0,vanilla.BX)({...initialState}),controller={state,subscribe:callback=>(0,vanilla.B1)(state,()=>callback(state)),subscribeKey:(key,callback)=>(0,utils.u$)(state,key,callback),getParams(){const namespace=ChainController.W.state.activeChain,caipAddress=ChainController.W.getAccountData(namespace)?.caipAddress??ChainController.W.state.activeCaipAddress,address=CoreHelperUtil.w.getPlainAddress(caipAddress),networkAddress=(0,ChainControllerUtil.K1)(),connectorId=ConnectorController.a.getConnectorId(ChainController.W.state.activeChain);if(!address)throw new Error("No address found to swap the tokens from.");const invalidToToken=!state.toToken?.address||!state.toToken?.decimals,invalidSourceToken=!state.sourceToken?.address||!state.sourceToken?.decimals||!NumberUtil.S.bigNumber(state.sourceTokenAmount).gt(0),invalidSourceTokenAmount=!state.sourceTokenAmount;return{networkAddress,fromAddress:address,fromCaipAddress:caipAddress,sourceTokenAddress:state.sourceToken?.address,toTokenAddress:state.toToken?.address,toTokenAmount:state.toTokenAmount,toTokenDecimals:state.toToken?.decimals,sourceTokenAmount:state.sourceTokenAmount,sourceTokenDecimals:state.sourceToken?.decimals,invalidToToken,invalidSourceToken,invalidSourceTokenAmount,availableToSwap:caipAddress&&!invalidToToken&&!invalidSourceToken&&!invalidSourceTokenAmount,isAuthConnector:connectorId===ConstantsUtil.o.CONNECTOR_ID.AUTH}},async setSourceToken(sourceToken){if(!sourceToken)return state.sourceToken=sourceToken,state.sourceTokenAmount="",void(state.sourceTokenPriceInUSD=0);state.sourceToken=sourceToken,await SwapController.setTokenPrice(sourceToken.address,"sourceToken")},setSourceTokenAmount(amount){state.sourceTokenAmount=amount},async setToToken(toToken){if(!toToken)return state.toToken=toToken,state.toTokenAmount="",void(state.toTokenPriceInUSD=0);state.toToken=toToken,await SwapController.setTokenPrice(toToken.address,"toToken")},setToTokenAmount(amount){state.toTokenAmount=amount?NumberUtil.S.toFixed(amount,6):""},async setTokenPrice(address,target){let price=state.tokensPriceMap[address]||0;price||(state.loadingPrices=!0,price=await SwapController.getAddressPrice(address)),"sourceToken"===target?state.sourceTokenPriceInUSD=price:"toToken"===target&&(state.toTokenPriceInUSD=price),state.loadingPrices&&(state.loadingPrices=!1),SwapController.getParams().availableToSwap&&!state.switchingTokens&&SwapController.swapTokens()},async switchTokens(){if(!state.initializing&&state.initialized&&!state.switchingTokens){state.switchingTokens=!0;try{const newSourceToken=state.toToken?{...state.toToken}:void 0,newToToken=state.sourceToken?{...state.sourceToken}:void 0,newSourceTokenAmount=newSourceToken&&""===state.toTokenAmount?"1":state.toTokenAmount;SwapController.setSourceTokenAmount(newSourceTokenAmount),SwapController.setToTokenAmount(""),await SwapController.setSourceToken(newSourceToken),await SwapController.setToToken(newToToken),state.switchingTokens=!1,SwapController.swapTokens()}catch(error){throw state.switchingTokens=!1,error}}},resetState(){state.myTokensWithBalance=initialState.myTokensWithBalance,state.tokensPriceMap=initialState.tokensPriceMap,state.initialized=initialState.initialized,state.initializing=initialState.initializing,state.switchingTokens=initialState.switchingTokens,state.sourceToken=initialState.sourceToken,state.sourceTokenAmount=initialState.sourceTokenAmount,state.sourceTokenPriceInUSD=initialState.sourceTokenPriceInUSD,state.toToken=initialState.toToken,state.toTokenAmount=initialState.toTokenAmount,state.toTokenPriceInUSD=initialState.toTokenPriceInUSD,state.networkPrice=initialState.networkPrice,state.networkTokenSymbol=initialState.networkTokenSymbol,state.networkBalanceInUSD=initialState.networkBalanceInUSD,state.inputError=initialState.inputError},resetValues(){const{networkAddress}=SwapController.getParams(),networkToken=state.tokens?.find(token=>token.address===networkAddress);SwapController.setSourceToken(networkToken),SwapController.setToToken(void 0)},getApprovalLoadingState:()=>state.loadingApprovalTransaction,clearError(){state.transactionError=void 0},async initializeState(){if(!state.initializing){if(state.initializing=!0,!state.initialized)try{await SwapController.fetchTokens(),state.initialized=!0}catch(error){state.initialized=!1,SnackController.P.showError("Failed to initialize swap"),RouterController.I.goBack()}state.initializing=!1}},async fetchTokens(){const{networkAddress}=SwapController.getParams();await SwapController.getNetworkTokenPrice(),await SwapController.getMyTokensWithBalance();const networkToken=state.myTokensWithBalance?.find(token=>token.address===networkAddress);networkToken&&(state.networkTokenSymbol=networkToken.symbol,SwapController.setSourceToken(networkToken),SwapController.setSourceTokenAmount("0"))},async getTokenList(){const activeCaipNetworkId=ChainController.W.state.activeCaipNetwork?.caipNetworkId;if(state.caipNetworkId!==activeCaipNetworkId||!state.tokens)try{state.tokensLoading=!0;const tokens=await SwapApiUtil.s.getTokenList(activeCaipNetworkId);state.tokens=tokens,state.caipNetworkId=activeCaipNetworkId,state.popularTokens=tokens.sort((aTokenInfo,bTokenInfo)=>aTokenInfo.symbol<bTokenInfo.symbol?-1:aTokenInfo.symbol>bTokenInfo.symbol?1:0);const suggestedTokenObjects=(activeCaipNetworkId&&utils_ConstantsUtil.oU.SUGGESTED_TOKENS_BY_CHAIN?.[activeCaipNetworkId]||[]).map(symbol=>tokens.find(t=>t.symbol===symbol)).filter(t=>Boolean(t)),allSuggestedTokenObjects=(utils_ConstantsUtil.oU.SWAP_SUGGESTED_TOKENS||[]).map(symbol=>tokens.find(t=>t.symbol===symbol)).filter(t=>Boolean(t)).filter(t=>!suggestedTokenObjects.some(ct=>ct.address===t.address));state.suggestedTokens=[...suggestedTokenObjects,...allSuggestedTokenObjects]}catch(error){state.tokens=[],state.popularTokens=[],state.suggestedTokens=[]}finally{state.tokensLoading=!1}},async getAddressPrice(address){const existPrice=state.tokensPriceMap[address];if(existPrice)return existPrice;const response=await BlockchainApiController.T.fetchTokenPrice({addresses:[address]}),fungibles=response?.fungibles||[],allTokens=[...state.tokens||[],...state.myTokensWithBalance||[]],symbol=allTokens?.find(token=>token.address===address)?.symbol,price=fungibles.find(p=>p.symbol.toLowerCase()===symbol?.toLowerCase())?.price||0,priceAsFloat=parseFloat(price.toString());return state.tokensPriceMap[address]=priceAsFloat,priceAsFloat},async getNetworkTokenPrice(){const{networkAddress}=SwapController.getParams(),response=await BlockchainApiController.T.fetchTokenPrice({addresses:[networkAddress]}).catch(()=>(SnackController.P.showError("Failed to fetch network token price"),{fungibles:[]})),token=response.fungibles?.[0],price=token?.price.toString()||"0";state.tokensPriceMap[networkAddress]=parseFloat(price),state.networkTokenSymbol=token?.symbol||"",state.networkPrice=price},async getMyTokensWithBalance(forceUpdate){const balances=await BalanceUtil.Z.getMyTokensWithBalance({forceUpdate,caipNetwork:ChainController.W.state.activeCaipNetwork,address:ChainController.W.getAccountData()?.address}),swapBalances=SwapApiUtil.s.mapBalancesToSwapTokens(balances);swapBalances&&(await SwapController.getInitialGasPrice(),SwapController.setBalances(swapBalances))},setBalances(balances){const{networkAddress}=SwapController.getParams(),caipNetwork=ChainController.W.state.activeCaipNetwork;if(!caipNetwork)return;const networkToken=balances.find(token=>token.address===networkAddress);balances.forEach(token=>{state.tokensPriceMap[token.address]=token.price||0}),state.myTokensWithBalance=balances.filter(token=>token.address.startsWith(caipNetwork.caipNetworkId)),state.networkBalanceInUSD=networkToken?NumberUtil.S.multiply(networkToken.quantity.numeric,networkToken.price).toString():"0"},async getInitialGasPrice(){const res=await SwapApiUtil.s.fetchGasPrice();if(!res)return{gasPrice:null,gasPriceInUSD:null};switch(ChainController.W.state?.activeCaipNetwork?.chainNamespace){case ConstantsUtil.o.CHAIN.SOLANA:return state.gasFee=res.standard??"0",state.gasPriceInUSD=NumberUtil.S.multiply(res.standard,state.networkPrice).div(1e9).toNumber(),{gasPrice:BigInt(state.gasFee),gasPriceInUSD:Number(state.gasPriceInUSD)};case ConstantsUtil.o.CHAIN.EVM:default:const value=res.standard??"0",gasFee=BigInt(value),gasLimit=BigInt(15e4),gasPrice=SwapCalculationUtil.getGasPriceInUSD(state.networkPrice,gasLimit,gasFee);return state.gasFee=value,state.gasPriceInUSD=gasPrice,{gasPrice:gasFee,gasPriceInUSD:gasPrice}}},async swapTokens(){const address=ChainController.W.getAccountData()?.address,sourceToken=state.sourceToken,toToken=state.toToken,haveSourceTokenAmount=NumberUtil.S.bigNumber(state.sourceTokenAmount).gt(0);if(haveSourceTokenAmount||SwapController.setToTokenAmount(""),!toToken||!sourceToken||state.loadingPrices||!haveSourceTokenAmount||!address)return;state.loadingQuote=!0;const amountDecimal=NumberUtil.S.bigNumber(state.sourceTokenAmount).times(10**sourceToken.decimals).round(0).toFixed(0);try{const quoteResponse=await BlockchainApiController.T.fetchSwapQuote({userAddress:address,from:sourceToken.address,to:toToken.address,gasPrice:state.gasFee,amount:amountDecimal.toString()});state.loadingQuote=!1;const quoteToAmount=quoteResponse?.quotes?.[0]?.toAmount;if(!quoteToAmount)return void AlertController.h.open({displayMessage:"Incorrect amount",debugMessage:"Please enter a valid amount"},"error");const toTokenAmount=NumberUtil.S.bigNumber(quoteToAmount).div(10**toToken.decimals).toString();SwapController.setToTokenAmount(toTokenAmount);SwapController.hasInsufficientToken(state.sourceTokenAmount,sourceToken.address)?state.inputError="Insufficient balance":(state.inputError=void 0,SwapController.setTransactionDetails())}catch(error){const response=await SwapApiUtil.s.handleSwapError(error);state.loadingQuote=!1,state.inputError=response||"Insufficient balance"}},async getTransaction(){const{fromCaipAddress,availableToSwap}=SwapController.getParams(),sourceToken=state.sourceToken,toToken=state.toToken;if(fromCaipAddress&&availableToSwap&&sourceToken&&toToken&&!state.loadingQuote)try{state.loadingBuildTransaction=!0;let transaction;return transaction=await SwapApiUtil.s.fetchSwapAllowance({userAddress:fromCaipAddress,tokenAddress:sourceToken.address,sourceTokenAmount:state.sourceTokenAmount,sourceTokenDecimals:sourceToken.decimals})?await SwapController.createSwapTransaction():await SwapController.createAllowanceTransaction(),state.loadingBuildTransaction=!1,state.fetchError=!1,transaction}catch(error){return RouterController.I.goBack(),SnackController.P.showError("Failed to check allowance"),state.loadingBuildTransaction=!1,state.approvalTransaction=void 0,state.swapTransaction=void 0,void(state.fetchError=!0)}},async createAllowanceTransaction(){const{fromCaipAddress,sourceTokenAddress,toTokenAddress}=SwapController.getParams();if(fromCaipAddress&&toTokenAddress){if(!sourceTokenAddress)throw new Error("createAllowanceTransaction - No source token address found.");try{const response=await BlockchainApiController.T.generateApproveCalldata({from:sourceTokenAddress,to:toTokenAddress,userAddress:fromCaipAddress}),address=CoreHelperUtil.w.getPlainAddress(response.tx.from);if(!address)throw new Error("SwapController:createAllowanceTransaction - address is required");const transaction={data:response.tx.data,to:address,gasPrice:BigInt(response.tx.eip155.gasPrice),value:BigInt(response.tx.value),toAmount:state.toTokenAmount};return state.swapTransaction=void 0,state.approvalTransaction={data:transaction.data,to:transaction.to,gasPrice:transaction.gasPrice,value:transaction.value,toAmount:transaction.toAmount},{data:transaction.data,to:transaction.to,gasPrice:transaction.gasPrice,value:transaction.value,toAmount:transaction.toAmount}}catch(error){return RouterController.I.goBack(),SnackController.P.showError("Failed to create approval transaction"),state.approvalTransaction=void 0,state.swapTransaction=void 0,void(state.fetchError=!0)}}},async createSwapTransaction(){const{networkAddress,fromCaipAddress,sourceTokenAmount}=SwapController.getParams(),sourceToken=state.sourceToken,toToken=state.toToken;if(!(fromCaipAddress&&sourceTokenAmount&&sourceToken&&toToken))return;const amount=ConnectionController.x.parseUnits(sourceTokenAmount,sourceToken.decimals)?.toString();try{const response=await BlockchainApiController.T.generateSwapCalldata({userAddress:fromCaipAddress,from:sourceToken.address,to:toToken.address,amount,disableEstimate:!0}),isSourceTokenIsNetworkToken=sourceToken.address===networkAddress,gas=BigInt(response.tx.eip155.gas),gasPrice=BigInt(response.tx.eip155.gasPrice),address=CoreHelperUtil.w.getPlainAddress(response.tx.to);if(!address)throw new Error("SwapController:createSwapTransaction - address is required");const transaction={data:response.tx.data,to:address,gas,gasPrice,value:isSourceTokenIsNetworkToken?BigInt(amount??"0"):BigInt("0"),toAmount:state.toTokenAmount};return state.gasPriceInUSD=SwapCalculationUtil.getGasPriceInUSD(state.networkPrice,gas,gasPrice),state.approvalTransaction=void 0,state.swapTransaction=transaction,transaction}catch(error){return RouterController.I.goBack(),SnackController.P.showError("Failed to create transaction"),state.approvalTransaction=void 0,state.swapTransaction=void 0,void(state.fetchError=!0)}},onEmbeddedWalletApprovalSuccess(){SnackController.P.showLoading("Approve limit increase in your wallet"),RouterController.I.replace("SwapPreview")},async sendTransactionForApproval(data){const{fromAddress,isAuthConnector}=SwapController.getParams();state.loadingApprovalTransaction=!0;isAuthConnector?RouterController.I.pushTransactionStack({onSuccess:SwapController.onEmbeddedWalletApprovalSuccess}):SnackController.P.showLoading("Approve limit increase in your wallet");try{await ConnectionController.x.sendTransaction({address:fromAddress,to:data.to,data:data.data,value:data.value,chainNamespace:ConstantsUtil.o.CHAIN.EVM}),await SwapController.swapTokens(),await SwapController.getTransaction(),state.approvalTransaction=void 0,state.loadingApprovalTransaction=!1}catch(err){const error=err;state.transactionError=error?.displayMessage,state.loadingApprovalTransaction=!1,SnackController.P.showError(error?.displayMessage||"Transaction error"),EventsController.E.sendEvent({type:"track",event:"SWAP_APPROVAL_ERROR",properties:{message:error?.displayMessage||error?.message||"Unknown",network:ChainController.W.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:SwapController.state.sourceToken?.symbol||"",swapToToken:SwapController.state.toToken?.symbol||"",swapFromAmount:SwapController.state.sourceTokenAmount||"",swapToAmount:SwapController.state.toTokenAmount||"",isSmartAccount:(0,ChainControllerUtil.lj)(ConstantsUtil.o.CHAIN.EVM)===W3mFrameConstants.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}})}},async sendTransactionForSwap(data){if(!data)return;const{fromAddress,toTokenAmount,isAuthConnector}=SwapController.getParams();state.loadingTransaction=!0;const snackbarPendingMessage=`Swapping ${state.sourceToken?.symbol} to ${NumberUtil.S.formatNumberToLocalString(toTokenAmount,3)} ${state.toToken?.symbol}`,snackbarSuccessMessage=`Swapped ${state.sourceToken?.symbol} to ${NumberUtil.S.formatNumberToLocalString(toTokenAmount,3)} ${state.toToken?.symbol}`;isAuthConnector?RouterController.I.pushTransactionStack({onSuccess(){RouterController.I.replace("Account"),SnackController.P.showLoading(snackbarPendingMessage),controller.resetState()}}):SnackController.P.showLoading("Confirm transaction in your wallet");try{const forceUpdateAddresses=[state.sourceToken?.address,state.toToken?.address].join(","),transactionHash=await ConnectionController.x.sendTransaction({address:fromAddress,to:data.to,data:data.data,value:data.value,chainNamespace:ConstantsUtil.o.CHAIN.EVM});return state.loadingTransaction=!1,SnackController.P.showSuccess(snackbarSuccessMessage),EventsController.E.sendEvent({type:"track",event:"SWAP_SUCCESS",properties:{network:ChainController.W.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:SwapController.state.sourceToken?.symbol||"",swapToToken:SwapController.state.toToken?.symbol||"",swapFromAmount:SwapController.state.sourceTokenAmount||"",swapToAmount:SwapController.state.toTokenAmount||"",isSmartAccount:(0,ChainControllerUtil.lj)(ConstantsUtil.o.CHAIN.EVM)===W3mFrameConstants.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}}),controller.resetState(),isAuthConnector||RouterController.I.replace("Account"),controller.getMyTokensWithBalance(forceUpdateAddresses),transactionHash}catch(err){const error=err;return state.transactionError=error?.displayMessage,state.loadingTransaction=!1,SnackController.P.showError(error?.displayMessage||"Transaction error"),void EventsController.E.sendEvent({type:"track",event:"SWAP_ERROR",properties:{message:error?.displayMessage||error?.message||"Unknown",network:ChainController.W.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:SwapController.state.sourceToken?.symbol||"",swapToToken:SwapController.state.toToken?.symbol||"",swapFromAmount:SwapController.state.sourceTokenAmount||"",swapToAmount:SwapController.state.toTokenAmount||"",isSmartAccount:(0,ChainControllerUtil.lj)(ConstantsUtil.o.CHAIN.EVM)===W3mFrameConstants.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}})}},hasInsufficientToken:(sourceTokenAmount,sourceTokenAddress)=>SwapCalculationUtil.isInsufficientSourceTokenForSwap(sourceTokenAmount,sourceTokenAddress,state.myTokensWithBalance),setTransactionDetails(){const{toTokenAddress,toTokenDecimals}=SwapController.getParams();toTokenAddress&&toTokenDecimals&&(state.gasPriceInUSD=SwapCalculationUtil.getGasPriceInUSD(state.networkPrice,BigInt(state.gasFee),BigInt(15e4)),state.priceImpact=SwapCalculationUtil.getPriceImpact({sourceTokenAmount:state.sourceTokenAmount,sourceTokenPriceInUSD:state.sourceTokenPriceInUSD,toTokenPriceInUSD:state.toTokenPriceInUSD,toTokenAmount:state.toTokenAmount}),state.maxSlippage=SwapCalculationUtil.getMaxSlippage(state.slippage,state.toTokenAmount),state.providerFee=SwapCalculationUtil.getProviderFee(state.sourceTokenAmount))}},SwapController=(0,withErrorBoundary.X)(controller);var esm_exports=__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/index.js"),ThemeUtil=__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/utils/ThemeUtil.js"),WebComponentsUtil=__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/utils/WebComponentsUtil.js"),ThemeHelperUtil=__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/utils/ThemeHelperUtil.js");const styles=ThemeHelperUtil.AH`
  :host {
    display: block;
    border-radius: clamp(0px, ${({borderRadius})=>borderRadius[8]}, 44px);
    box-shadow: 0 0 0 1px ${({tokens})=>tokens.theme.foregroundPrimary};
    overflow: hidden;
  }
`;var __decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let WuiCard=class WuiCard extends lit.WF{render(){return lit.qy`<slot></slot>`}};WuiCard.styles=[ThemeUtil.W5,styles],WuiCard=__decorate([(0,WebComponentsUtil.E)("wui-card")],WuiCard);__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/wui-flex.js"),__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/components/wui-icon/index.js"),__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/components/wui-text/index.js"),__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/layout/wui-flex/index.js");const wui_alertbar_styles=ThemeHelperUtil.AH`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing})=>spacing[2]};
    padding: ${({spacing})=>spacing[3]};
    border-radius: ${({borderRadius})=>borderRadius[6]};
    border: 1px solid ${({tokens})=>tokens.theme.borderPrimary};
    box-sizing: border-box;
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    color: ${({tokens})=>tokens.theme.textPrimary};
  }

  :host > wui-flex[data-type='info'] {
    .icon-box {
      background-color: ${({tokens})=>tokens.theme.foregroundSecondary};

      wui-icon {
        color: ${({tokens})=>tokens.theme.iconDefault};
      }
    }
  }
  :host > wui-flex[data-type='success'] {
    .icon-box {
      background-color: ${({tokens})=>tokens.core.backgroundSuccess};

      wui-icon {
        color: ${({tokens})=>tokens.core.borderSuccess};
      }
    }
  }
  :host > wui-flex[data-type='warning'] {
    .icon-box {
      background-color: ${({tokens})=>tokens.core.backgroundWarning};

      wui-icon {
        color: ${({tokens})=>tokens.core.borderWarning};
      }
    }
  }
  :host > wui-flex[data-type='error'] {
    .icon-box {
      background-color: ${({tokens})=>tokens.core.backgroundError};

      wui-icon {
        color: ${({tokens})=>tokens.core.borderError};
      }
    }
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
    color: ${({tokens})=>tokens.theme.iconDefault};
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius})=>borderRadius[2]};
    background-color: var(--local-icon-bg-value);
  }
`;var wui_alertbar_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};const TYPE_ICON_NAME={info:"info",success:"checkmark",warning:"warningCircle",error:"warning"};let WuiAlertBar=class WuiAlertBar extends lit.WF{constructor(){super(...arguments),this.message="",this.type="info"}render(){return lit.qy`
      <wui-flex
        data-type=${(0,if_defined.J)(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${TYPE_ICON_NAME[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){AlertController.h.close()}};WuiAlertBar.styles=[ThemeUtil.W5,wui_alertbar_styles],wui_alertbar_decorate([(0,decorators.MZ)()],WuiAlertBar.prototype,"message",void 0),wui_alertbar_decorate([(0,decorators.MZ)()],WuiAlertBar.prototype,"type",void 0),WuiAlertBar=wui_alertbar_decorate([(0,WebComponentsUtil.E)("wui-alertbar")],WuiAlertBar);const w3m_alertbar_styles=esm_exports.AH`
  :host {
    display: block;
    position: absolute;
    top: ${({spacing})=>spacing[3]};
    left: ${({spacing})=>spacing[4]};
    right: ${({spacing})=>spacing[4]};
    opacity: 0;
    pointer-events: none;
  }
`;var w3m_alertbar_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};const presets={info:{backgroundColor:"fg-350",iconColor:"fg-325",icon:"info"},success:{backgroundColor:"success-glass-reown-020",iconColor:"success-125",icon:"checkmark"},warning:{backgroundColor:"warning-glass-reown-020",iconColor:"warning-100",icon:"warningCircle"},error:{backgroundColor:"error-glass-reown-020",iconColor:"error-125",icon:"warning"}};let W3mAlertBar=class W3mAlertBar extends lit.WF{constructor(){super(),this.unsubscribe=[],this.open=AlertController.h.state.open,this.onOpen(!0),this.unsubscribe.push(AlertController.h.subscribeKey("open",val=>{this.open=val,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe())}render(){const{message,variant}=AlertController.h.state,preset=presets[variant];return lit.qy`
      <wui-alertbar
        message=${message}
        backgroundColor=${preset?.backgroundColor}
        iconColor=${preset?.iconColor}
        icon=${preset?.icon}
        type=${variant}
      ></wui-alertbar>
    `}onOpen(isMounted){this.open?(this.animate([{opacity:0,transform:"scale(0.85)"},{opacity:1,transform:"scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: auto"):isMounted||(this.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: none")}};W3mAlertBar.styles=w3m_alertbar_styles,w3m_alertbar_decorate([(0,decorators.wk)()],W3mAlertBar.prototype,"open",void 0),W3mAlertBar=w3m_alertbar_decorate([(0,esm_exports.EM)("w3m-alertbar")],W3mAlertBar);var AssetUtil=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/utils/AssetUtil.js"),AssetController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/AssetController.js");const wui_icon_button_styles=ThemeHelperUtil.AH`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing})=>spacing[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens})=>tokens.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens})=>tokens.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens})=>tokens.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens})=>tokens.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens})=>tokens.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius})=>borderRadius[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius})=>borderRadius[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius})=>borderRadius[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius})=>borderRadius[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens})=>tokens.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens})=>tokens.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens})=>tokens.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens})=>tokens.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var wui_icon_button_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let WuiIconButton=class WuiIconButton extends lit.WF{constructor(){super(...arguments),this.icon="card",this.variant="primary",this.type="accent",this.size="md",this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return lit.qy`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${(0,if_defined.J)(this.iconSize)}></wui-icon>
    </button>`}};WuiIconButton.styles=[ThemeUtil.W5,ThemeUtil.fD,wui_icon_button_styles],wui_icon_button_decorate([(0,decorators.MZ)()],WuiIconButton.prototype,"icon",void 0),wui_icon_button_decorate([(0,decorators.MZ)()],WuiIconButton.prototype,"variant",void 0),wui_icon_button_decorate([(0,decorators.MZ)()],WuiIconButton.prototype,"type",void 0),wui_icon_button_decorate([(0,decorators.MZ)()],WuiIconButton.prototype,"size",void 0),wui_icon_button_decorate([(0,decorators.MZ)()],WuiIconButton.prototype,"iconSize",void 0),wui_icon_button_decorate([(0,decorators.MZ)({type:Boolean})],WuiIconButton.prototype,"fullWidth",void 0),wui_icon_button_decorate([(0,decorators.MZ)({type:Boolean})],WuiIconButton.prototype,"disabled",void 0),WuiIconButton=wui_icon_button_decorate([(0,WebComponentsUtil.E)("wui-icon-button")],WuiIconButton);__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/components/wui-image/index.js");const wui_select_styles=ThemeHelperUtil.AH`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing})=>spacing[1]};
    transition: background-color ${({durations})=>durations.lg}
      ${({easings})=>easings["ease-out-power-2"]};
    will-change: background-color;
    border-radius: ${({borderRadius})=>borderRadius[32]};
  }

  wui-image {
    border-radius: 100%;
  }

  wui-text {
    padding-left: ${({spacing})=>spacing[1]};
  }

  .left-icon-container,
  .right-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  wui-icon {
    color: ${({tokens})=>tokens.theme.iconDefault};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-type='filled-dropdown'] {
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
  }

  button[data-type='text-dropdown'] {
    background-color: transparent;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens})=>tokens.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
    opacity: 0.5;
  }
`;var wui_select_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};const TEXT_VARIANT_BY_SIZE={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},ICON_SIZE_BY_SIZE={lg:"lg",md:"md",sm:"sm"};let WuiSelect=class WuiSelect extends lit.WF{constructor(){super(...arguments),this.imageSrc="",this.text="",this.size="lg",this.type="text-dropdown",this.disabled=!1}render(){return lit.qy`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`}textTemplate(){const textSize=TEXT_VARIANT_BY_SIZE[this.size];return this.text?lit.qy`<wui-text color="primary" variant=${textSize}>${this.text}</wui-text>`:null}imageTemplate(){if(this.imageSrc)return lit.qy`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`;const iconSize=ICON_SIZE_BY_SIZE[this.size];return lit.qy` <wui-flex class="left-icon-container">
      <wui-icon size=${iconSize} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}};WuiSelect.styles=[ThemeUtil.W5,ThemeUtil.fD,wui_select_styles],wui_select_decorate([(0,decorators.MZ)()],WuiSelect.prototype,"imageSrc",void 0),wui_select_decorate([(0,decorators.MZ)()],WuiSelect.prototype,"text",void 0),wui_select_decorate([(0,decorators.MZ)()],WuiSelect.prototype,"size",void 0),wui_select_decorate([(0,decorators.MZ)()],WuiSelect.prototype,"type",void 0),wui_select_decorate([(0,decorators.MZ)({type:Boolean})],WuiSelect.prototype,"disabled",void 0),WuiSelect=wui_select_decorate([(0,WebComponentsUtil.E)("wui-select")],WuiSelect);__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/composites/wui-tag/index.js"),__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/wui-text.js");const ConstantsUtil_ConstantsUtil={ACCOUNT_TABS:[{label:"Tokens"},{label:"Activity"}],SECURE_SITE_ORIGIN:(void 0!==__webpack_require__("./node_modules/process/browser.js")?{NODE_ENV:"production",NODE_PATH:[],STORYBOOK:"true",PUBLIC_URL:"."}.NEXT_PUBLIC_SECURE_SITE_ORIGIN:void 0)||"https://secure.walletconnect.org",VIEW_DIRECTION:{Next:"next",Prev:"prev"},ANIMATION_DURATIONS:{HeaderText:120,ModalHeight:150,ViewTransition:150},VIEWS_WITH_LEGAL_FOOTER:["Connect","ConnectWallets","OnRampTokenSelect","OnRampFiatSelect","OnRampProviders"],VIEWS_WITH_DEFAULT_FOOTER:["Networks"]};__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/wui-button.js"),__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/wui-icon.js");const wui_icon_link_styles=ThemeHelperUtil.AH`
  button {
    background-color: transparent;
    padding: ${({spacing})=>spacing[1]};
  }

  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens})=>tokens.core.foregroundAccent020};
  }

  button[data-variant='accent']:hover:enabled,
  button[data-variant='accent']:focus-visible {
    background-color: ${({tokens})=>tokens.core.foregroundAccent010};
  }

  button[data-variant='primary']:hover:enabled,
  button[data-variant='primary']:focus-visible,
  button[data-variant='secondary']:hover:enabled,
  button[data-variant='secondary']:focus-visible {
    background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
  }

  button[data-size='xs'] > wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='xs'],
  button[data-size='sm'] {
    border-radius: ${({borderRadius})=>borderRadius[1]};
  }

  button[data-size='md'],
  button[data-size='lg'] {
    border-radius: ${({borderRadius})=>borderRadius[2]};
  }

  button[data-size='md'] > wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] > wui-icon {
    width: 20px;
    height: 20px;
  }

  button:disabled {
    background-color: transparent;
    cursor: not-allowed;
    opacity: 0.5;
  }

  button:hover:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
  }

  button:focus-visible:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
`;var wui_icon_link_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let WuiIconLink=class WuiIconLink extends lit.WF{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.icon="copy",this.iconColor="default",this.variant="accent"}render(){return lit.qy`
      <button data-variant=${this.variant} ?disabled=${this.disabled} data-size=${this.size}>
        <wui-icon
          color=${{accent:"accent-primary",primary:"inverse",secondary:"default"}[this.variant]||this.iconColor}
          size=${this.size}
          name=${this.icon}
        ></wui-icon>
      </button>
    `}};WuiIconLink.styles=[ThemeUtil.W5,ThemeUtil.fD,wui_icon_link_styles],wui_icon_link_decorate([(0,decorators.MZ)()],WuiIconLink.prototype,"size",void 0),wui_icon_link_decorate([(0,decorators.MZ)({type:Boolean})],WuiIconLink.prototype,"disabled",void 0),wui_icon_link_decorate([(0,decorators.MZ)()],WuiIconLink.prototype,"icon",void 0),wui_icon_link_decorate([(0,decorators.MZ)()],WuiIconLink.prototype,"iconColor",void 0),wui_icon_link_decorate([(0,decorators.MZ)()],WuiIconLink.prototype,"variant",void 0),WuiIconLink=wui_icon_link_decorate([(0,WebComponentsUtil.E)("wui-icon-link")],WuiIconLink);__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/wui-list-item.js"),__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/wui-loading-spinner.js");const networkSvgLg=lit.JW`<svg width="86" height="96" fill="none">
  <path
    d="M78.3244 18.926L50.1808 2.45078C45.7376 -0.150261 40.2624 -0.150262 35.8192 2.45078L7.6756 18.926C3.23322 21.5266 0.5 26.3301 0.5 31.5248V64.4752C0.5 69.6699 3.23322 74.4734 7.6756 77.074L35.8192 93.5492C40.2624 96.1503 45.7376 96.1503 50.1808 93.5492L78.3244 77.074C82.7668 74.4734 85.5 69.6699 85.5 64.4752V31.5248C85.5 26.3301 82.7668 21.5266 78.3244 18.926Z"
  />
</svg>`;var networkMd=__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/assets/svg/networkMd.js");const networkSvgSm=lit.JW`
  <svg fill="none" viewBox="0 0 36 40">
    <path
      d="M15.4 2.1a5.21 5.21 0 0 1 5.2 0l11.61 6.7a5.21 5.21 0 0 1 2.61 4.52v13.4c0 1.87-1 3.59-2.6 4.52l-11.61 6.7c-1.62.93-3.6.93-5.22 0l-11.6-6.7a5.21 5.21 0 0 1-2.61-4.51v-13.4c0-1.87 1-3.6 2.6-4.52L15.4 2.1Z"
    />
  </svg>
`,wui_network_image_styles=ThemeHelperUtil.AH`
  :host {
    position: relative;
    border-radius: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--local-width);
    height: var(--local-height);
  }

  :host([data-round='true']) {
    background: ${({tokens})=>tokens.theme.foregroundPrimary};
    border-radius: 100%;
    outline: 1px solid ${({tokens})=>tokens.core.glass010};
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  svg > path {
    stroke: var(--local-stroke);
  }

  wui-image {
    width: 100%;
    height: 100%;
    -webkit-clip-path: var(--local-path);
    clip-path: var(--local-path);
    background: ${({tokens})=>tokens.theme.foregroundPrimary};
  }

  wui-icon {
    transform: translateY(-5%);
    width: var(--local-icon-size);
    height: var(--local-icon-size);
  }
`;var wui_network_image_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let WuiNetworkImage=class WuiNetworkImage extends lit.WF{constructor(){super(...arguments),this.size="md",this.name="uknown",this.networkImagesBySize={sm:networkSvgSm,md:networkMd.a,lg:networkSvgLg},this.selected=!1,this.round=!1}render(){const getSize={sm:"4",md:"6",lg:"10"};return this.round?(this.dataset.round="true",this.style.cssText="\n      --local-width: var(--apkt-spacing-10);\n      --local-height: var(--apkt-spacing-10);\n      --local-icon-size: var(--apkt-spacing-4);\n    "):this.style.cssText=`\n\n      --local-path: var(--apkt-path-network-${this.size});\n      --local-width:  var(--apkt-width-network-${this.size});\n      --local-height:  var(--apkt-height-network-${this.size});\n      --local-icon-size:  var(--apkt-spacing-${getSize[this.size]});\n    `,lit.qy`${this.templateVisual()} ${this.svgTemplate()} `}svgTemplate(){return this.round?null:this.networkImagesBySize[this.size]}templateVisual(){return this.imageSrc?lit.qy`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`:lit.qy`<wui-icon size="inherit" color="default" name="networkPlaceholder"></wui-icon>`}};WuiNetworkImage.styles=[ThemeUtil.W5,wui_network_image_styles],wui_network_image_decorate([(0,decorators.MZ)()],WuiNetworkImage.prototype,"size",void 0),wui_network_image_decorate([(0,decorators.MZ)()],WuiNetworkImage.prototype,"name",void 0),wui_network_image_decorate([(0,decorators.MZ)({type:Object})],WuiNetworkImage.prototype,"networkImagesBySize",void 0),wui_network_image_decorate([(0,decorators.MZ)()],WuiNetworkImage.prototype,"imageSrc",void 0),wui_network_image_decorate([(0,decorators.MZ)({type:Boolean})],WuiNetworkImage.prototype,"selected",void 0),wui_network_image_decorate([(0,decorators.MZ)({type:Boolean})],WuiNetworkImage.prototype,"round",void 0),WuiNetworkImage=wui_network_image_decorate([(0,WebComponentsUtil.E)("wui-network-image")],WuiNetworkImage);const wui_separator_styles=ThemeHelperUtil.AH`
  :host {
    position: relative;
    display: flex;
    width: 100%;
    height: 1px;
    background-color: ${({tokens})=>tokens.theme.borderPrimary};
    justify-content: center;
    align-items: center;
  }

  :host > wui-text {
    position: absolute;
    padding: 0px 8px;
    transition: background-color ${({durations})=>durations.lg}
      ${({easings})=>easings["ease-out-power-2"]};
    will-change: background-color;
  }

  :host([data-bg-color='primary']) > wui-text {
    background-color: ${({tokens})=>tokens.theme.backgroundPrimary};
  }

  :host([data-bg-color='secondary']) > wui-text {
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
  }
`;var wui_separator_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let WuiSeparator=class WuiSeparator extends lit.WF{constructor(){super(...arguments),this.text="",this.bgColor="primary"}render(){return this.dataset.bgColor=this.bgColor,lit.qy`${this.template()}`}template(){return this.text?lit.qy`<wui-text variant="md-regular" color="secondary">${this.text}</wui-text>`:null}};WuiSeparator.styles=[ThemeUtil.W5,wui_separator_styles],wui_separator_decorate([(0,decorators.MZ)()],WuiSeparator.prototype,"text",void 0),wui_separator_decorate([(0,decorators.MZ)()],WuiSeparator.prototype,"bgColor",void 0),WuiSeparator=wui_separator_decorate([(0,WebComponentsUtil.E)("wui-separator")],WuiSeparator);__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/wui-wallet-image.js");var ParseUtil=__webpack_require__("./node_modules/@reown/appkit-common/dist/esm/src/utils/ParseUtil.js"),HelpersUtil=__webpack_require__("./node_modules/@reown/appkit-utils/dist/esm/src/HelpersUtil.js");const AppKitPayErrorCodes_INVALID_PAYMENT_CONFIG="INVALID_PAYMENT_CONFIG",AppKitPayErrorCodes_INVALID_RECIPIENT="INVALID_RECIPIENT",AppKitPayErrorCodes_INVALID_ASSET="INVALID_ASSET",AppKitPayErrorCodes_INVALID_AMOUNT="INVALID_AMOUNT",AppKitPayErrorCodes_UNKNOWN_ERROR="UNKNOWN_ERROR",AppKitPayErrorCodes_UNABLE_TO_INITIATE_PAYMENT="UNABLE_TO_INITIATE_PAYMENT",AppKitPayErrorCodes_INVALID_CHAIN_NAMESPACE="INVALID_CHAIN_NAMESPACE",AppKitPayErrorCodes_GENERIC_PAYMENT_ERROR="GENERIC_PAYMENT_ERROR",AppKitPayErrorCodes_UNABLE_TO_GET_EXCHANGES="UNABLE_TO_GET_EXCHANGES",AppKitPayErrorCodes_ASSET_NOT_SUPPORTED="ASSET_NOT_SUPPORTED",AppKitPayErrorCodes_UNABLE_TO_GET_PAY_URL="UNABLE_TO_GET_PAY_URL",AppKitPayErrorCodes_UNABLE_TO_GET_BUY_STATUS="UNABLE_TO_GET_BUY_STATUS",AppKitPayErrorCodes_UNABLE_TO_GET_TOKEN_BALANCES="UNABLE_TO_GET_TOKEN_BALANCES",AppKitPayErrorCodes_UNABLE_TO_GET_QUOTE="UNABLE_TO_GET_QUOTE",AppKitPayErrorCodes_UNABLE_TO_GET_QUOTE_STATUS="UNABLE_TO_GET_QUOTE_STATUS",AppKitPayErrorCodes_INVALID_RECIPIENT_ADDRESS_FOR_ASSET="INVALID_RECIPIENT_ADDRESS_FOR_ASSET",AppKitPayErrorMessages={[AppKitPayErrorCodes_INVALID_PAYMENT_CONFIG]:"Invalid payment configuration",[AppKitPayErrorCodes_INVALID_RECIPIENT]:"Invalid recipient address",[AppKitPayErrorCodes_INVALID_ASSET]:"Invalid asset specified",[AppKitPayErrorCodes_INVALID_AMOUNT]:"Invalid payment amount",[AppKitPayErrorCodes_INVALID_RECIPIENT_ADDRESS_FOR_ASSET]:"Invalid recipient address for the asset selected",[AppKitPayErrorCodes_UNKNOWN_ERROR]:"Unknown payment error occurred",[AppKitPayErrorCodes_UNABLE_TO_INITIATE_PAYMENT]:"Unable to initiate payment",[AppKitPayErrorCodes_INVALID_CHAIN_NAMESPACE]:"Invalid chain namespace",[AppKitPayErrorCodes_GENERIC_PAYMENT_ERROR]:"Unable to process payment",[AppKitPayErrorCodes_UNABLE_TO_GET_EXCHANGES]:"Unable to get exchanges",[AppKitPayErrorCodes_ASSET_NOT_SUPPORTED]:"Asset not supported by the selected exchange",[AppKitPayErrorCodes_UNABLE_TO_GET_PAY_URL]:"Unable to get payment URL",[AppKitPayErrorCodes_UNABLE_TO_GET_BUY_STATUS]:"Unable to get buy status",[AppKitPayErrorCodes_UNABLE_TO_GET_TOKEN_BALANCES]:"Unable to get token balances",[AppKitPayErrorCodes_UNABLE_TO_GET_QUOTE]:"Unable to get quote. Please choose a different token",[AppKitPayErrorCodes_UNABLE_TO_GET_QUOTE_STATUS]:"Unable to get quote status"};class AppKitPayError extends Error{get message(){return AppKitPayErrorMessages[this.code]}constructor(code,details){super(AppKitPayErrorMessages[code]),this.name="AppKitPayError",this.code=code,this.details=details,Error.captureStackTrace&&Error.captureStackTrace(this,AppKitPayError)}}var FetchUtil=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/utils/FetchUtil.js");var ContractUtil=__webpack_require__("./node_modules/@reown/appkit-common/dist/esm/src/utils/ContractUtil.js"),ProviderController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/ProviderController.js");function getTransferStep(quote){if(!quote)return null;const step=quote.steps[0];return step&&step.type===DIRECT_TRANSFER_DEPOSIT_TYPE?step:null}function getTransactionsSteps(quote,completedTransactionsCount=0){if(!quote)return[];const steps=quote.steps.filter(step=>step.type===DIRECT_TRANSFER_TRANSACTION_TYPE),stepsToShow=steps.filter((_,idx)=>idx+1>completedTransactionsCount);return steps.length>0&&steps.length<3?stepsToShow:[]}const api=new FetchUtil.Z({baseUrl:CoreHelperUtil.w.getApiUrl(),clientId:null});class JsonRpcError extends Error{}function getSdkProperties(){const{projectId,sdkType,sdkVersion}=OptionsController.H.state;return{projectId,st:sdkType||"appkit",sv:sdkVersion||"html-wagmi-4.2.2"}}async function sendRequest(method,params){const url=function getApiUrl(){return`https://rpc.walletconnect.org/v1/json-rpc?projectId=${OptionsController.H.getSnapshot().projectId}`}(),{sdkType:st,sdkVersion:sv,projectId}=OptionsController.H.getSnapshot(),requestBody={jsonrpc:"2.0",id:1,method,params:{...params||{},st,sv,projectId}},response=await fetch(url,{method:"POST",body:JSON.stringify(requestBody),headers:{"Content-Type":"application/json"}}),json=await response.json();if(json.error)throw new JsonRpcError(json.error.message);return json}async function getExchanges(params){return(await sendRequest("reown_getExchanges",params)).result}async function getPayUrl(params){return(await sendRequest("reown_getExchangePayUrl",params)).result}async function getQuote(params){const isSameChain=HelpersUtil.y.isLowerCaseMatch(params.sourceToken.network,params.toToken.network),isSameAsset=HelpersUtil.y.isLowerCaseMatch(params.sourceToken.asset,params.toToken.asset);return isSameChain&&isSameAsset?async function getDirectTransferQuote({sourceToken,toToken,amount,recipient}){const originalAmount=ConnectionController.x.parseUnits(amount,sourceToken.metadata.decimals),destinationAmount=ConnectionController.x.parseUnits(amount,toToken.metadata.decimals);return Promise.resolve({type:DIRECT_TRANSFER_REQUEST_ID,origin:{amount:originalAmount?.toString()??"0",currency:sourceToken},destination:{amount:destinationAmount?.toString()??"0",currency:toToken},fees:[{id:"service",label:"Service Fee",amount:"0",currency:toToken}],steps:[{requestId:DIRECT_TRANSFER_REQUEST_ID,type:"deposit",deposit:{amount:originalAmount?.toString()??"0",currency:sourceToken.asset,receiver:recipient}}],timeInSeconds:6})}(params):async function getTransfersQuote(params){const amount=NumberUtil.S.bigNumber(params.amount).times(10**params.toToken.metadata.decimals).toString(),{chainId:originChainId,chainNamespace:originChainNamespace}=ParseUtil.C.parseCaipNetworkId(params.sourceToken.network),{chainId:destinationChainId,chainNamespace:destinationChainNamespace}=ParseUtil.C.parseCaipNetworkId(params.toToken.network),originCurrency="native"===params.sourceToken.asset?(0,ChainControllerUtil.NH)(originChainNamespace):params.sourceToken.asset,destinationCurrency="native"===params.toToken.asset?(0,ChainControllerUtil.NH)(destinationChainNamespace):params.toToken.asset;return await api.post({path:"/appkit/v1/transfers/quote",body:{user:params.address,originChainId:originChainId.toString(),originCurrency,destinationChainId:destinationChainId.toString(),destinationCurrency,recipient:params.recipient,amount},params:getSdkProperties()})}(params)}const SUPPORT_PAY_WITH_WALLET_CHAIN_NAMESPACES=["eip155","solana"],CHAIN_ASSET_INFO_MAP={eip155:{native:{assetNamespace:"slip44",assetReference:"60"},defaultTokenNamespace:"erc20"},solana:{native:{assetNamespace:"slip44",assetReference:"501"},defaultTokenNamespace:"token"}};function formatCaip19Asset(caipNetworkId,asset){const{chainNamespace,chainId}=ParseUtil.C.parseCaipNetworkId(caipNetworkId),chainInfo=CHAIN_ASSET_INFO_MAP[chainNamespace];if(!chainInfo)throw new Error(`Unsupported chain namespace for CAIP-19 formatting: ${chainNamespace}`);let assetNamespace=chainInfo.native.assetNamespace,assetReference=chainInfo.native.assetReference;"native"!==asset&&(assetNamespace=chainInfo.defaultTokenNamespace,assetReference=asset);return`${`${chainNamespace}:${chainId}`}/${assetNamespace}:${assetReference}`}function formatAmount(amount){const num=NumberUtil.S.bigNumber(amount,{safe:!0});return num.lt(.001)?"<0.001":num.round(4).toString()}const DIRECT_TRANSFER_REQUEST_ID="direct-transfer",DIRECT_TRANSFER_DEPOSIT_TYPE="deposit",DIRECT_TRANSFER_TRANSACTION_TYPE="transaction",PayController_state=(0,vanilla.BX)({paymentAsset:{network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},recipient:"0x0",amount:0,isConfigured:!1,error:null,isPaymentInProgress:!1,exchanges:[],isLoading:!1,openInNewTab:!0,redirectUrl:void 0,payWithExchange:void 0,currentPayment:void 0,analyticsSet:!1,paymentId:void 0,choice:"pay",tokenBalances:{[ConstantsUtil.o.CHAIN.EVM]:[],[ConstantsUtil.o.CHAIN.SOLANA]:[]},isFetchingTokenBalances:!1,selectedPaymentAsset:null,quote:void 0,quoteStatus:"waiting",quoteError:null,isFetchingQuote:!1,selectedExchange:void 0,exchangeUrlForQuote:void 0,requestId:void 0}),PayController={state:PayController_state,subscribe:callback=>(0,vanilla.B1)(PayController_state,()=>callback(PayController_state)),subscribeKey:(key,callback)=>(0,utils.u$)(PayController_state,key,callback),async handleOpenPay(options){this.resetState(),this.setPaymentConfig(options),this.initializeAnalytics(),function ensureCorrectAddress(){const{chainNamespace}=ParseUtil.C.parseCaipNetworkId(PayController.state.paymentAsset.network);if(!CoreHelperUtil.w.isAddress(PayController.state.recipient,chainNamespace))throw new AppKitPayError(AppKitPayErrorCodes_INVALID_RECIPIENT_ADDRESS_FOR_ASSET,`Provide valid recipient address for namespace "${chainNamespace}"`)}(),await this.prepareTokenLogo(),PayController_state.isConfigured=!0,EventsController.E.sendEvent({type:"track",event:"PAY_MODAL_OPEN",properties:{exchanges:PayController_state.exchanges,configuration:{network:PayController_state.paymentAsset.network,asset:PayController_state.paymentAsset.asset,recipient:PayController_state.recipient,amount:PayController_state.amount}}}),await ModalController.W.open({view:"Pay"})},resetState(){PayController_state.paymentAsset={network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},PayController_state.recipient="0x0",PayController_state.amount=0,PayController_state.isConfigured=!1,PayController_state.error=null,PayController_state.isPaymentInProgress=!1,PayController_state.isLoading=!1,PayController_state.currentPayment=void 0,PayController_state.selectedExchange=void 0,PayController_state.exchangeUrlForQuote=void 0,PayController_state.requestId=void 0},resetQuoteState(){PayController_state.quote=void 0,PayController_state.quoteStatus="waiting",PayController_state.quoteError=null,PayController_state.isFetchingQuote=!1,PayController_state.requestId=void 0},setPaymentConfig(config){if(!config.paymentAsset)throw new AppKitPayError(AppKitPayErrorCodes_INVALID_PAYMENT_CONFIG);try{PayController_state.choice=config.choice??"pay",PayController_state.paymentAsset=config.paymentAsset,PayController_state.recipient=config.recipient,PayController_state.amount=config.amount,PayController_state.openInNewTab=config.openInNewTab??!0,PayController_state.redirectUrl=config.redirectUrl,PayController_state.payWithExchange=config.payWithExchange,PayController_state.error=null}catch(error){throw new AppKitPayError(AppKitPayErrorCodes_INVALID_PAYMENT_CONFIG,error.message)}},setSelectedPaymentAsset(paymentAsset){PayController_state.selectedPaymentAsset=paymentAsset},setSelectedExchange(exchange){PayController_state.selectedExchange=exchange},setRequestId(requestId){PayController_state.requestId=requestId},setPaymentInProgress(isPaymentInProgress){PayController_state.isPaymentInProgress=isPaymentInProgress},getPaymentAsset:()=>PayController_state.paymentAsset,getExchanges:()=>PayController_state.exchanges,async fetchExchanges(){try{PayController_state.isLoading=!0;const response=await getExchanges({page:0});PayController_state.exchanges=response.exchanges.slice(0,2)}catch(error){throw SnackController.P.showError(AppKitPayErrorMessages.UNABLE_TO_GET_EXCHANGES),new AppKitPayError(AppKitPayErrorCodes_UNABLE_TO_GET_EXCHANGES)}finally{PayController_state.isLoading=!1}},async getAvailableExchanges(params){try{const asset=params?.asset&&params?.network?formatCaip19Asset(params.network,params.asset):void 0;return await getExchanges({page:params?.page??0,asset,amount:params?.amount?.toString()})}catch(error){throw new AppKitPayError(AppKitPayErrorCodes_UNABLE_TO_GET_EXCHANGES)}},async getPayUrl(exchangeId,params,headless=!1){try{const numericAmount=Number(params.amount),response=await getPayUrl({exchangeId,asset:formatCaip19Asset(params.network,params.asset),amount:numericAmount.toString(),recipient:`${params.network}:${params.recipient}`});return EventsController.E.sendEvent({type:"track",event:"PAY_EXCHANGE_SELECTED",properties:{source:"pay",exchange:{id:exchangeId},configuration:{network:params.network,asset:params.asset,recipient:params.recipient,amount:numericAmount},currentPayment:{type:"exchange",exchangeId},headless}}),headless&&(this.initiatePayment(),EventsController.E.sendEvent({type:"track",event:"PAY_INITIATED",properties:{source:"pay",paymentId:PayController_state.paymentId||"unknown",configuration:{network:params.network,asset:params.asset,recipient:params.recipient,amount:numericAmount},currentPayment:{type:"exchange",exchangeId}}})),response}catch(error){if(error instanceof Error&&error.message.includes("is not supported"))throw new AppKitPayError(AppKitPayErrorCodes_ASSET_NOT_SUPPORTED);throw new Error(error.message)}},async generateExchangeUrlForQuote({exchangeId,paymentAsset,amount,recipient}){const response=await getPayUrl({exchangeId,asset:formatCaip19Asset(paymentAsset.network,paymentAsset.asset),amount:amount.toString(),recipient});PayController_state.exchangeSessionId=response.sessionId,PayController_state.exchangeUrlForQuote=response.url},async openPayUrl(openParams,params,headless=!1){try{const payUrl=await this.getPayUrl(openParams.exchangeId,params,headless);if(!payUrl)throw new AppKitPayError(AppKitPayErrorCodes_UNABLE_TO_GET_PAY_URL);const target=openParams.openInNewTab??!0?"_blank":"_self";return CoreHelperUtil.w.openHref(payUrl.url,target),payUrl}catch(error){throw PayController_state.error=error instanceof AppKitPayError?error.message:AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR,new AppKitPayError(AppKitPayErrorCodes_UNABLE_TO_GET_PAY_URL)}},async onTransfer({chainNamespace,fromAddress,toAddress,amount,paymentAsset}){if(PayController_state.currentPayment={type:"wallet",status:"IN_PROGRESS"},!PayController_state.isPaymentInProgress)try{this.initiatePayment();const targetNetwork=ChainController.W.getAllRequestedCaipNetworks().find(net=>net.caipNetworkId===paymentAsset.network);if(!targetNetwork)throw new Error("Target network not found");const caipNetwork=ChainController.W.state.activeCaipNetwork;switch(HelpersUtil.y.isLowerCaseMatch(caipNetwork?.caipNetworkId,targetNetwork.caipNetworkId)||await ChainController.W.switchActiveNetwork(targetNetwork),chainNamespace){case ConstantsUtil.o.CHAIN.EVM:"native"===paymentAsset.asset&&(PayController_state.currentPayment.result=await async function processEvmNativePayment(paymentAsset,chainNamespace,params){if(chainNamespace!==ConstantsUtil.o.CHAIN.EVM)throw new AppKitPayError(AppKitPayErrorCodes_INVALID_CHAIN_NAMESPACE);if(!params.fromAddress)throw new AppKitPayError(AppKitPayErrorCodes_INVALID_PAYMENT_CONFIG,"fromAddress is required for native EVM payments.");const amountValue="string"==typeof params.amount?parseFloat(params.amount):params.amount;if(isNaN(amountValue))throw new AppKitPayError(AppKitPayErrorCodes_INVALID_PAYMENT_CONFIG);const decimals=paymentAsset.metadata?.decimals??18,amountBigInt=ConnectionController.x.parseUnits(amountValue.toString(),decimals);if("bigint"!=typeof amountBigInt)throw new AppKitPayError(AppKitPayErrorCodes_GENERIC_PAYMENT_ERROR);return await ConnectionController.x.sendTransaction({chainNamespace,to:params.recipient,address:params.fromAddress,value:amountBigInt,data:"0x"})??void 0}(paymentAsset,chainNamespace,{recipient:toAddress,amount,fromAddress})),paymentAsset.asset.startsWith("0x")&&(PayController_state.currentPayment.result=await async function processEvmErc20Payment(paymentAsset,params){if(!params.fromAddress)throw new AppKitPayError(AppKitPayErrorCodes_INVALID_PAYMENT_CONFIG,"fromAddress is required for ERC20 EVM payments.");const tokenAddress=paymentAsset.asset,recipientAddress=params.recipient,decimals=Number(paymentAsset.metadata.decimals),amountBigInt=ConnectionController.x.parseUnits(params.amount.toString(),decimals);if(void 0===amountBigInt)throw new AppKitPayError(AppKitPayErrorCodes_GENERIC_PAYMENT_ERROR);return await ConnectionController.x.writeContract({fromAddress:params.fromAddress,tokenAddress,args:[recipientAddress,amountBigInt],method:"transfer",abi:ContractUtil.v.getERC20Abi(tokenAddress),chainNamespace:ConstantsUtil.o.CHAIN.EVM})??void 0}(paymentAsset,{recipient:toAddress,amount,fromAddress})),PayController_state.currentPayment.status="SUCCESS";break;case ConstantsUtil.o.CHAIN.SOLANA:PayController_state.currentPayment.result=await async function processSolanaPayment(chainNamespace,params){if(chainNamespace!==ConstantsUtil.o.CHAIN.SOLANA)throw new AppKitPayError(AppKitPayErrorCodes_INVALID_CHAIN_NAMESPACE);if(!params.fromAddress)throw new AppKitPayError(AppKitPayErrorCodes_INVALID_PAYMENT_CONFIG,"fromAddress is required for Solana payments.");const amountValue="string"==typeof params.amount?parseFloat(params.amount):params.amount;if(isNaN(amountValue)||amountValue<=0)throw new AppKitPayError(AppKitPayErrorCodes_INVALID_PAYMENT_CONFIG,"Invalid payment amount.");try{if(!ProviderController.G.getProvider(chainNamespace))throw new AppKitPayError(AppKitPayErrorCodes_GENERIC_PAYMENT_ERROR,"No Solana provider available.");const txResponse=await ConnectionController.x.sendTransaction({chainNamespace:ConstantsUtil.o.CHAIN.SOLANA,to:params.recipient,value:amountValue,tokenMint:params.tokenMint});if(!txResponse)throw new AppKitPayError(AppKitPayErrorCodes_GENERIC_PAYMENT_ERROR,"Transaction failed.");return txResponse}catch(error){if(error instanceof AppKitPayError)throw error;throw new AppKitPayError(AppKitPayErrorCodes_GENERIC_PAYMENT_ERROR,`Solana payment failed: ${error}`)}}(chainNamespace,{recipient:toAddress,amount,fromAddress,tokenMint:"native"===paymentAsset.asset?void 0:paymentAsset.asset}),PayController_state.currentPayment.status="SUCCESS";break;default:throw new AppKitPayError(AppKitPayErrorCodes_INVALID_CHAIN_NAMESPACE)}}catch(error){throw PayController_state.error=error instanceof AppKitPayError?error.message:AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR,PayController_state.currentPayment.status="FAILED",SnackController.P.showError(PayController_state.error),error}finally{PayController_state.isPaymentInProgress=!1}},async onSendTransaction(params){try{const{namespace,transactionStep}=params;PayController.initiatePayment();const targetNetwork=ChainController.W.getAllRequestedCaipNetworks().find(net=>net.caipNetworkId===PayController_state.paymentAsset?.network);if(!targetNetwork)throw new Error("Target network not found");const caipNetwork=ChainController.W.state.activeCaipNetwork;if(HelpersUtil.y.isLowerCaseMatch(caipNetwork?.caipNetworkId,targetNetwork.caipNetworkId)||await ChainController.W.switchActiveNetwork(targetNetwork),namespace===ConstantsUtil.o.CHAIN.EVM){const{from,to,data,value}=transactionStep.transaction;await ConnectionController.x.sendTransaction({address:from,to,data,value:BigInt(value),chainNamespace:namespace})}else if(namespace===ConstantsUtil.o.CHAIN.SOLANA){const{instructions}=transactionStep.transaction;await ConnectionController.x.writeSolanaTransaction({instructions})}}catch(error){throw PayController_state.error=error instanceof AppKitPayError?error.message:AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR,SnackController.P.showError(PayController_state.error),error}finally{PayController_state.isPaymentInProgress=!1}},getExchangeById:exchangeId=>PayController_state.exchanges.find(exchange=>exchange.id===exchangeId),validatePayConfig(config){const{paymentAsset,recipient,amount}=config;if(!paymentAsset)throw new AppKitPayError(AppKitPayErrorCodes_INVALID_PAYMENT_CONFIG);if(!recipient)throw new AppKitPayError(AppKitPayErrorCodes_INVALID_RECIPIENT);if(!paymentAsset.asset)throw new AppKitPayError(AppKitPayErrorCodes_INVALID_ASSET);if(null==amount||amount<=0)throw new AppKitPayError(AppKitPayErrorCodes_INVALID_AMOUNT)},async handlePayWithExchange(exchangeId){try{PayController_state.currentPayment={type:"exchange",exchangeId};const{network,asset}=PayController_state.paymentAsset,payUrlParams={network,asset,amount:PayController_state.amount,recipient:PayController_state.recipient},payUrl=await this.getPayUrl(exchangeId,payUrlParams);if(!payUrl)throw new AppKitPayError(AppKitPayErrorCodes_UNABLE_TO_INITIATE_PAYMENT);return PayController_state.currentPayment.sessionId=payUrl.sessionId,PayController_state.currentPayment.status="IN_PROGRESS",PayController_state.currentPayment.exchangeId=exchangeId,this.initiatePayment(),{url:payUrl.url,openInNewTab:PayController_state.openInNewTab}}catch(error){return PayController_state.error=error instanceof AppKitPayError?error.message:AppKitPayErrorMessages.GENERIC_PAYMENT_ERROR,PayController_state.isPaymentInProgress=!1,SnackController.P.showError(PayController_state.error),null}},async getBuyStatus(exchangeId,sessionId){try{const status=await async function getBuyStatus(params){return(await sendRequest("reown_getExchangeBuyStatus",params)).result}({sessionId,exchangeId});return"SUCCESS"!==status.status&&"FAILED"!==status.status||EventsController.E.sendEvent({type:"track",event:"SUCCESS"===status.status?"PAY_SUCCESS":"PAY_ERROR",properties:{message:"FAILED"===status.status?CoreHelperUtil.w.parseError(PayController_state.error):void 0,source:"pay",paymentId:PayController_state.paymentId||"unknown",configuration:{network:PayController_state.paymentAsset.network,asset:PayController_state.paymentAsset.asset,recipient:PayController_state.recipient,amount:PayController_state.amount},currentPayment:{type:"exchange",exchangeId:PayController_state.currentPayment?.exchangeId,sessionId:PayController_state.currentPayment?.sessionId,result:status.txHash}}}),status}catch(error){throw new AppKitPayError(AppKitPayErrorCodes_UNABLE_TO_GET_BUY_STATUS)}},async fetchTokensFromEOA({caipAddress,caipNetwork,namespace}){if(!caipAddress)return[];const{address}=ParseUtil.C.parseCaipAddress(caipAddress);let overideCaipNetwork=caipNetwork;namespace===ConstantsUtil.o.CHAIN.EVM&&(overideCaipNetwork=void 0);return await BalanceUtil.Z.getMyTokensWithBalance({address,caipNetwork:overideCaipNetwork})},async fetchTokensFromExchange(){if(!PayController_state.selectedExchange)return[];const assets=await async function getAssetsForExchange(exchangeId){return await api.get({path:`/appkit/v1/transfers/assets/exchanges/${exchangeId}`,params:getSdkProperties()})}(PayController_state.selectedExchange.id),allAssets=Object.values(assets.assets).flat();return await Promise.all(allAssets.map(async token=>{const balance=function formatPaymentAssetToBalance(paymentAsset){return{chainId:paymentAsset.network,address:`${paymentAsset.network}:${paymentAsset.asset}`,symbol:paymentAsset.metadata.symbol,name:paymentAsset.metadata.name,iconUrl:paymentAsset.metadata.logoURI||"",price:0,quantity:{numeric:"0",decimals:paymentAsset.metadata.decimals.toString()}}}(token),{chainNamespace}=ParseUtil.C.parseCaipNetworkId(balance.chainId);let address=balance.address;if(CoreHelperUtil.w.isCaipAddress(address)){const{address:parsedAddress}=ParseUtil.C.parseCaipAddress(address);address=parsedAddress}const image=await AssetUtil.$.getImageByToken(address??"",chainNamespace).catch(()=>{});return balance.iconUrl=image??"",balance}))},async fetchTokens({caipAddress,caipNetwork,namespace}){try{PayController_state.isFetchingTokenBalances=!0;const balancesFnPromise=Boolean(PayController_state.selectedExchange)?this.fetchTokensFromExchange():this.fetchTokensFromEOA({caipAddress,caipNetwork,namespace}),balances=await balancesFnPromise;PayController_state.tokenBalances={...PayController_state.tokenBalances,[namespace]:balances}}catch(err){const message=err instanceof Error?err.message:"Unable to get token balances";SnackController.P.showError(message)}finally{PayController_state.isFetchingTokenBalances=!1}},async fetchQuote({amount,address,sourceToken,toToken,recipient}){try{PayController.resetQuoteState(),PayController_state.isFetchingQuote=!0;const quote=await getQuote({amount,address:PayController_state.selectedExchange?void 0:address,sourceToken,toToken,recipient});if(PayController_state.selectedExchange){const transferStep=getTransferStep(quote);if(transferStep){const caipDepositAddress=`${sourceToken.network}:${transferStep.deposit.receiver}`,depositAmount=NumberUtil.S.formatNumber(transferStep.deposit.amount,{decimals:sourceToken.metadata.decimals??0,round:8});await PayController.generateExchangeUrlForQuote({exchangeId:PayController_state.selectedExchange.id,paymentAsset:sourceToken,amount:depositAmount.toString(),recipient:caipDepositAddress})}}PayController_state.quote=quote}catch(err){let errMessage=AppKitPayErrorMessages.UNABLE_TO_GET_QUOTE;if(err instanceof Error&&err.cause&&err.cause instanceof Response)try{const errorData=await err.cause.json();errorData.error&&"string"==typeof errorData.error&&(errMessage=errorData.error)}catch{}throw PayController_state.quoteError=errMessage,SnackController.P.showError(errMessage),new AppKitPayError(AppKitPayErrorCodes_UNABLE_TO_GET_QUOTE)}finally{PayController_state.isFetchingQuote=!1}},async fetchQuoteStatus({requestId}){try{if(requestId===DIRECT_TRANSFER_REQUEST_ID){const selectedExchange=PayController_state.selectedExchange,sessionId=PayController_state.exchangeSessionId;if(selectedExchange&&sessionId){switch((await this.getBuyStatus(selectedExchange.id,sessionId)).status){case"IN_PROGRESS":case"UNKNOWN":default:PayController_state.quoteStatus="waiting";break;case"SUCCESS":PayController_state.quoteStatus="success",PayController_state.isPaymentInProgress=!1;break;case"FAILED":PayController_state.quoteStatus="failure",PayController_state.isPaymentInProgress=!1}return}return void(PayController_state.quoteStatus="success")}const{status}=await async function getQuoteStatus(params){return await api.get({path:"/appkit/v1/transfers/status",params:{requestId:params.requestId,...getSdkProperties()}})}({requestId});PayController_state.quoteStatus=status}catch{throw PayController_state.quoteStatus="failure",new AppKitPayError(AppKitPayErrorCodes_UNABLE_TO_GET_QUOTE_STATUS)}},initiatePayment(){PayController_state.isPaymentInProgress=!0,PayController_state.paymentId=crypto.randomUUID()},initializeAnalytics(){PayController_state.analyticsSet||(PayController_state.analyticsSet=!0,this.subscribeKey("isPaymentInProgress",_=>{if(PayController_state.currentPayment?.status&&"UNKNOWN"!==PayController_state.currentPayment.status){const eventType={IN_PROGRESS:"PAY_INITIATED",SUCCESS:"PAY_SUCCESS",FAILED:"PAY_ERROR"}[PayController_state.currentPayment.status];EventsController.E.sendEvent({type:"track",event:eventType,properties:{message:"FAILED"===PayController_state.currentPayment.status?CoreHelperUtil.w.parseError(PayController_state.error):void 0,source:"pay",paymentId:PayController_state.paymentId||"unknown",configuration:{network:PayController_state.paymentAsset.network,asset:PayController_state.paymentAsset.asset,recipient:PayController_state.recipient,amount:PayController_state.amount},currentPayment:{type:PayController_state.currentPayment.type,exchangeId:PayController_state.currentPayment.exchangeId,sessionId:PayController_state.currentPayment.sessionId,result:PayController_state.currentPayment.result}}})}}))},async prepareTokenLogo(){if(!PayController_state.paymentAsset.metadata.logoURI)try{const{chainNamespace}=ParseUtil.C.parseCaipNetworkId(PayController_state.paymentAsset.network),imageUrl=await AssetUtil.$.getImageByToken(PayController_state.paymentAsset.asset,chainNamespace);PayController_state.paymentAsset.metadata.logoURI=imageUrl}catch{}}},w3m_pay_view_styles=esm_exports.AH`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1) var(--apkt-spacing-2)
      calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
  }

  .token-display {
    padding: var(--apkt-spacing-3) var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-5);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    margin-top: var(--apkt-spacing-3);
    margin-bottom: var(--apkt-spacing-3);
  }

  .token-display wui-text {
    text-transform: none;
  }

  wui-loading-spinner {
    padding: var(--apkt-spacing-2);
  }

  .left-image-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius})=>borderRadius.round};
    width: 40px;
    height: 40px;
  }

  .chain-image {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius})=>borderRadius.round};
    border: 2px solid ${({tokens})=>tokens.theme.backgroundPrimary};
  }

  .payment-methods-container {
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius})=>borderRadius[8]};
    border-top-left-radius: ${({borderRadius})=>borderRadius[8]};
  }
`;var console=__webpack_require__("./node_modules/console-browserify/index.js"),w3m_pay_view_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mPayView=class W3mPayView extends lit.WF{constructor(){super(),this.unsubscribe=[],this.amount=PayController.state.amount,this.namespace=void 0,this.paymentAsset=PayController.state.paymentAsset,this.activeConnectorIds=ConnectorController.a.state.activeConnectorIds,this.caipAddress=void 0,this.exchanges=PayController.state.exchanges,this.isLoading=PayController.state.isLoading,this.initializeNamespace(),this.unsubscribe.push(PayController.subscribeKey("amount",val=>this.amount=val)),this.unsubscribe.push(ConnectorController.a.subscribeKey("activeConnectorIds",ids=>this.activeConnectorIds=ids)),this.unsubscribe.push(PayController.subscribeKey("exchanges",val=>this.exchanges=val)),this.unsubscribe.push(PayController.subscribeKey("isLoading",val=>this.isLoading=val)),PayController.fetchExchanges(),PayController.setSelectedExchange(void 0)}disconnectedCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe())}render(){return lit.qy`
      <wui-flex flexDirection="column">
        ${this.paymentDetailsTemplate()} ${this.paymentMethodsTemplate()}
      </wui-flex>
    `}paymentMethodsTemplate(){return lit.qy`
      <wui-flex flexDirection="column" padding="3" gap="2" class="payment-methods-container">
        ${this.payWithWalletTemplate()} ${this.templateSeparator()}
        ${this.templateExchangeOptions()}
      </wui-flex>
    `}initializeNamespace(){const namespace=ChainController.W.state.activeChain;this.namespace=namespace,this.caipAddress=ChainController.W.getAccountData(namespace)?.caipAddress,this.unsubscribe.push(ChainController.W.subscribeChainProp("accountState",accountState=>{this.caipAddress=accountState?.caipAddress},namespace))}paymentDetailsTemplate(){const targetNetwork=ChainController.W.getAllRequestedCaipNetworks().find(net=>net.caipNetworkId===this.paymentAsset.network);return lit.qy`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        .padding=${["6","8","6","8"]}
        gap="2"
      >
        <wui-flex alignItems="center" gap="1">
          <wui-text variant="h1-regular" color="primary">
            ${formatAmount(this.amount||"0")}
          </wui-text>

          <wui-flex flexDirection="column">
            <wui-text variant="h6-regular" color="secondary">
              ${this.paymentAsset.metadata.symbol||"Unknown"}
            </wui-text>
            <wui-text variant="md-medium" color="secondary"
              >on ${targetNetwork?.name||"Unknown"}</wui-text
            >
          </wui-flex>
        </wui-flex>

        <wui-flex class="left-image-container">
          <wui-image
            src=${(0,if_defined.J)(this.paymentAsset.metadata.logoURI)}
            class="token-image"
          ></wui-image>
          <wui-image
            src=${(0,if_defined.J)(AssetUtil.$.getNetworkImage(targetNetwork))}
            class="chain-image"
          ></wui-image>
        </wui-flex>
      </wui-flex>
    `}payWithWalletTemplate(){return function isPayWithWalletSupported(networkId){const{chainNamespace}=ParseUtil.C.parseCaipNetworkId(networkId);return SUPPORT_PAY_WITH_WALLET_CHAIN_NAMESPACES.includes(chainNamespace)}(this.paymentAsset.network)?this.caipAddress?this.connectedWalletTemplate():this.disconnectedWalletTemplate():lit.qy``}connectedWalletTemplate(){const{name,image}=this.getWalletProperties({namespace:this.namespace});return lit.qy`
      <wui-flex flexDirection="column" gap="3">
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${this.onWalletPayment}
          .boxed=${!1}
          ?chevron=${!0}
          ?fullSize=${!1}
          ?rounded=${!0}
          data-testid="wallet-payment-option"
          imageSrc=${(0,if_defined.J)(image)}
          imageSize="3xl"
        >
          <wui-text variant="lg-regular" color="primary">Pay with ${name}</wui-text>
        </wui-list-item>

        <wui-list-item
          type="secondary"
          icon="power"
          iconColor="error"
          @click=${this.onDisconnect}
          data-testid="disconnect-button"
          ?chevron=${!1}
          boxColor="foregroundSecondary"
        >
          <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `}disconnectedWalletTemplate(){return lit.qy`<wui-list-item
      type="secondary"
      boxColor="foregroundSecondary"
      variant="icon"
      iconColor="default"
      iconVariant="overlay"
      icon="wallet"
      @click=${this.onWalletPayment}
      ?chevron=${!0}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay with wallet</wui-text>
    </wui-list-item>`}templateExchangeOptions(){if(this.isLoading)return lit.qy`<wui-flex justifyContent="center" alignItems="center">
        <wui-loading-spinner size="md"></wui-loading-spinner>
      </wui-flex>`;const exchangesToShow=this.exchanges.filter(exchange=>function isTestnetAsset(paymentAsset){const targetNetwork=ChainController.W.getAllRequestedCaipNetworks().find(net=>net.caipNetworkId===paymentAsset.network);return!!targetNetwork&&Boolean(targetNetwork.testnet)}(this.paymentAsset)?"reown_test"===exchange.id:"reown_test"!==exchange.id);return 0===exchangesToShow.length?lit.qy`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`:exchangesToShow.map(exchange=>lit.qy`
        <wui-list-item
          type="secondary"
          boxColor="foregroundSecondary"
          @click=${()=>this.onExchangePayment(exchange)}
          data-testid="exchange-option-${exchange.id}"
          ?chevron=${!0}
          imageSrc=${(0,if_defined.J)(exchange.imageUrl)}
        >
          <wui-text flexGrow="1" variant="lg-regular" color="primary">
            Pay with ${exchange.name}
          </wui-text>
        </wui-list-item>
      `)}templateSeparator(){return lit.qy`<wui-separator text="or" bgColor="secondary"></wui-separator>`}async onWalletPayment(){if(!this.namespace)throw new Error("Namespace not found");this.caipAddress?RouterController.I.push("PayQuote"):(await ConnectorController.a.connect(),await ModalController.W.open({view:"PayQuote"}))}onExchangePayment(exchange){PayController.setSelectedExchange(exchange),RouterController.I.push("PayQuote")}async onDisconnect(){try{await ConnectionController.x.disconnect(),await ModalController.W.open({view:"Pay"})}catch{console.error("Failed to disconnect"),SnackController.P.showError("Failed to disconnect")}}getWalletProperties({namespace}){if(!namespace)return{name:void 0,image:void 0};const connectorId=this.activeConnectorIds[namespace];if(!connectorId)return{name:void 0,image:void 0};const connector=ConnectorController.a.getConnector({id:connectorId,namespace});if(!connector)return{name:void 0,image:void 0};const connectorImage=AssetUtil.$.getConnectorImage(connector);return{name:connector.name,image:connectorImage}}};W3mPayView.styles=w3m_pay_view_styles,w3m_pay_view_decorate([(0,decorators.wk)()],W3mPayView.prototype,"amount",void 0),w3m_pay_view_decorate([(0,decorators.wk)()],W3mPayView.prototype,"namespace",void 0),w3m_pay_view_decorate([(0,decorators.wk)()],W3mPayView.prototype,"paymentAsset",void 0),w3m_pay_view_decorate([(0,decorators.wk)()],W3mPayView.prototype,"activeConnectorIds",void 0),w3m_pay_view_decorate([(0,decorators.wk)()],W3mPayView.prototype,"caipAddress",void 0),w3m_pay_view_decorate([(0,decorators.wk)()],W3mPayView.prototype,"exchanges",void 0),w3m_pay_view_decorate([(0,decorators.wk)()],W3mPayView.prototype,"isLoading",void 0),W3mPayView=w3m_pay_view_decorate([(0,esm_exports.EM)("w3m-pay-view")],W3mPayView);var class_map=__webpack_require__("./node_modules/lit/directives/class-map.js");const wui_pulse_styles=ThemeHelperUtil.AH`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-container {
    position: relative;
    width: var(--pulse-size);
    height: var(--pulse-size);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-rings {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .pulse-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid var(--pulse-color);
    opacity: 0;
    animation: pulse var(--pulse-duration, 2s) ease-out infinite;
  }

  .pulse-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: var(--pulse-opacity, 0.3);
    }
    50% {
      opacity: calc(var(--pulse-opacity, 0.3) * 0.5);
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }
`;var wui_pulse_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};const COLOR_BY_VARIANT={"accent-primary":ThemeHelperUtil.f.tokens.core.backgroundAccentPrimary};let WuiPulse=class WuiPulse extends lit.WF{constructor(){super(...arguments),this.rings=3,this.duration=2,this.opacity=.3,this.size="200px",this.variant="accent-primary"}render(){const color=COLOR_BY_VARIANT[this.variant];this.style.cssText=`\n      --pulse-size: ${this.size};\n      --pulse-duration: ${this.duration}s;\n      --pulse-color: ${color};\n      --pulse-opacity: ${this.opacity};\n    `;const ringElements=Array.from({length:this.rings},(_,i)=>this.renderRing(i,this.rings));return lit.qy`
      <div class="pulse-container">
        <div class="pulse-rings">${ringElements}</div>
        <div class="pulse-content">
          <slot></slot>
        </div>
      </div>
    `}renderRing(index,total){const style=`animation-delay: ${index/total*this.duration}s;`;return lit.qy`<div class="pulse-ring" style=${style}></div>`}};WuiPulse.styles=[ThemeUtil.W5,wui_pulse_styles],wui_pulse_decorate([(0,decorators.MZ)({type:Number})],WuiPulse.prototype,"rings",void 0),wui_pulse_decorate([(0,decorators.MZ)({type:Number})],WuiPulse.prototype,"duration",void 0),wui_pulse_decorate([(0,decorators.MZ)({type:Number})],WuiPulse.prototype,"opacity",void 0),wui_pulse_decorate([(0,decorators.MZ)()],WuiPulse.prototype,"size",void 0),wui_pulse_decorate([(0,decorators.MZ)()],WuiPulse.prototype,"variant",void 0),WuiPulse=wui_pulse_decorate([(0,WebComponentsUtil.E)("wui-pulse")],WuiPulse);const STEPS=[{id:"received",title:"Receiving funds",icon:"dollar"},{id:"processing",title:"Swapping asset",icon:"recycleHorizontal"},{id:"sending",title:"Sending asset to the recipient address",icon:"send"}],TERMINAL_STATES=["success","submitted","failure","timeout","refund"],w3m_pay_loading_view_styles=esm_exports.AH`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-image {
    border-radius: ${({borderRadius})=>borderRadius.round};
  }

  .token-badge-container {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: ${({borderRadius})=>borderRadius[4]};
    z-index: 3;
    min-width: 105px;
  }

  .token-badge-container.loading {
    background-color: ${({tokens})=>tokens.theme.backgroundPrimary};
    border: 3px solid ${({tokens})=>tokens.theme.backgroundPrimary};
  }

  .token-badge-container.success {
    background-color: ${({tokens})=>tokens.theme.backgroundPrimary};
    border: 3px solid ${({tokens})=>tokens.theme.backgroundPrimary};
  }

  .token-image-container {
    position: relative;
  }

  .token-image {
    border-radius: ${({borderRadius})=>borderRadius.round};
    width: 64px;
    height: 64px;
  }

  .token-image.success {
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
  }

  .token-image.error {
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
  }

  .token-image.loading {
    background: ${({colors})=>colors.accent010};
  }

  .token-image wui-icon {
    width: 32px;
    height: 32px;
  }

  .token-badge {
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
    border: 1px solid ${({tokens})=>tokens.theme.foregroundSecondary};
    border-radius: ${({borderRadius})=>borderRadius[4]};
  }

  .token-badge wui-text {
    white-space: nowrap;
  }

  .payment-lifecycle-container {
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius})=>borderRadius[6]};
    border-top-left-radius: ${({borderRadius})=>borderRadius[6]};
  }

  .payment-step-badge {
    padding: ${({spacing})=>spacing[1]} ${({spacing})=>spacing[2]};
    border-radius: ${({borderRadius})=>borderRadius[1]};
  }

  .payment-step-badge.loading {
    background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
  }

  .payment-step-badge.error {
    background-color: ${({tokens})=>tokens.core.backgroundError};
  }

  .payment-step-badge.success {
    background-color: ${({tokens})=>tokens.core.backgroundSuccess};
  }

  .step-icon-container {
    position: relative;
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius})=>borderRadius.round};
    background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
  }

  .step-icon-box {
    position: absolute;
    right: -4px;
    bottom: -1px;
    padding: 2px;
    border-radius: ${({borderRadius})=>borderRadius.round};
    border: 2px solid ${({tokens})=>tokens.theme.backgroundPrimary};
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
  }

  .step-icon-box.success {
    background-color: ${({tokens})=>tokens.core.backgroundSuccess};
  }
`;var w3m_pay_loading_view_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};const STEP_COMPLETED_STATUSES={received:["pending","success","submitted"],processing:["success","submitted"],sending:["success","submitted"]};let W3mPayLoadingView=class W3mPayLoadingView extends lit.WF{constructor(){super(),this.unsubscribe=[],this.pollingInterval=null,this.paymentAsset=PayController.state.paymentAsset,this.quoteStatus=PayController.state.quoteStatus,this.quote=PayController.state.quote,this.amount=PayController.state.amount,this.namespace=void 0,this.caipAddress=void 0,this.profileName=null,this.activeConnectorIds=ConnectorController.a.state.activeConnectorIds,this.selectedExchange=PayController.state.selectedExchange,this.initializeNamespace(),this.unsubscribe.push(PayController.subscribeKey("quoteStatus",val=>this.quoteStatus=val),PayController.subscribeKey("quote",val=>this.quote=val),ConnectorController.a.subscribeKey("activeConnectorIds",ids=>this.activeConnectorIds=ids),PayController.subscribeKey("selectedExchange",val=>this.selectedExchange=val))}connectedCallback(){super.connectedCallback(),this.startPolling()}disconnectedCallback(){super.disconnectedCallback(),this.stopPolling(),this.unsubscribe.forEach(unsubscribe=>unsubscribe())}render(){return lit.qy`
      <wui-flex flexDirection="column" .padding=${["3","0","0","0"]} gap="2">
        ${this.tokenTemplate()} ${this.paymentTemplate()} ${this.paymentLifecycleTemplate()}
      </wui-flex>
    `}tokenTemplate(){const amount=formatAmount(this.amount||"0"),symbol=this.paymentAsset.metadata.symbol??"Unknown",targetNetwork=ChainController.W.getAllRequestedCaipNetworks().find(net=>net.caipNetworkId===this.paymentAsset.network),hasTransactionFailed="failure"===this.quoteStatus||"timeout"===this.quoteStatus||"refund"===this.quoteStatus;return"success"===this.quoteStatus||"submitted"===this.quoteStatus?lit.qy`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image success">
          <wui-icon name="checkmark" color="success" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:hasTransactionFailed?lit.qy`<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image error">
          <wui-icon name="close" color="error" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`:lit.qy`
      <wui-flex alignItems="center" justifyContent="center">
        <wui-flex class="token-image-container">
          <wui-pulse size="125px" rings="3" duration="4" opacity="0.5" variant="accent-primary">
            <wui-flex justifyContent="center" alignItems="center" class="token-image loading">
              <wui-icon name="paperPlaneTitle" color="accent-primary" size="inherit"></wui-icon>
            </wui-flex>
          </wui-pulse>

          <wui-flex
            justifyContent="center"
            alignItems="center"
            class="token-badge-container loading"
          >
            <wui-flex
              alignItems="center"
              justifyContent="center"
              gap="01"
              padding="1"
              class="token-badge"
            >
              <wui-image
                src=${(0,if_defined.J)(AssetUtil.$.getNetworkImage(targetNetwork))}
                class="chain-image"
                size="mdl"
              ></wui-image>

              <wui-text variant="lg-regular" color="primary">${amount} ${symbol}</wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}paymentTemplate(){return lit.qy`
      <wui-flex flexDirection="column" gap="2" .padding=${["0","6","0","6"]}>
        ${this.renderPayment()}
        <wui-separator></wui-separator>
        ${this.renderWallet()}
      </wui-flex>
    `}paymentLifecycleTemplate(){const stepsWithStatus=this.getStepsWithStatus();return lit.qy`
      <wui-flex flexDirection="column" padding="4" gap="2" class="payment-lifecycle-container">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">PAYMENT CYCLE</wui-text>

          ${this.renderPaymentCycleBadge()}
        </wui-flex>

        <wui-flex flexDirection="column" gap="5" .padding=${["2","0","2","0"]}>
          ${stepsWithStatus.map(step=>this.renderStep(step))}
        </wui-flex>
      </wui-flex>
    `}renderPaymentCycleBadge(){const hasTransactionFailed="failure"===this.quoteStatus||"timeout"===this.quoteStatus||"refund"===this.quoteStatus,hasTransactionSucceeded="success"===this.quoteStatus||"submitted"===this.quoteStatus;if(hasTransactionFailed)return lit.qy`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge error"
          gap="1"
        >
          <wui-icon name="close" color="error" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="error">Failed</wui-text>
        </wui-flex>
      `;if(hasTransactionSucceeded)return lit.qy`
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge success"
          gap="1"
        >
          <wui-icon name="checkmark" color="success" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="success">Completed</wui-text>
        </wui-flex>
      `;const timeEstimate=this.quote?.timeInSeconds??0;return lit.qy`
      <wui-flex alignItems="center" justifyContent="space-between" gap="3">
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge loading"
          gap="1"
        >
          <wui-icon name="clock" color="default" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="primary">Est. ${timeEstimate} sec</wui-text>
        </wui-flex>

        <wui-icon name="chevronBottom" color="default" size="xxs"></wui-icon>
      </wui-flex>
    `}renderPayment(){const targetNetwork=ChainController.W.getAllRequestedCaipNetworks().find(net=>{const network=this.quote?.origin.currency.network;if(!network)return!1;const{chainId}=ParseUtil.C.parseCaipNetworkId(network);return HelpersUtil.y.isLowerCaseMatch(net.id.toString(),chainId.toString())}),formattedAmount=formatAmount(NumberUtil.S.formatNumber(this.quote?.origin.amount||"0",{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString()),symbol=this.quote?.origin.currency.metadata.symbol??"Unknown";return lit.qy`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${["3","0","3","0"]}
      >
        <wui-text variant="lg-regular" color="secondary">Payment Method</wui-text>

        <wui-flex flexDirection="column" alignItems="flex-end" gap="1">
          <wui-flex alignItems="center" gap="01">
            <wui-text variant="lg-regular" color="primary">${formattedAmount}</wui-text>
            <wui-text variant="lg-regular" color="secondary">${symbol}</wui-text>
          </wui-flex>

          <wui-flex alignItems="center" gap="1">
            <wui-text variant="md-regular" color="secondary">on</wui-text>
            <wui-image
              src=${(0,if_defined.J)(AssetUtil.$.getNetworkImage(targetNetwork))}
              size="xs"
            ></wui-image>
            <wui-text variant="md-regular" color="secondary">${targetNetwork?.name}</wui-text>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}renderWallet(){return lit.qy`
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${["3","0","3","0"]}
      >
        <wui-text variant="lg-regular" color="secondary">Wallet</wui-text>

        ${this.renderWalletText()}
      </wui-flex>
    `}renderWalletText(){const{image}=this.getWalletProperties({namespace:this.namespace}),{address}=this.caipAddress?ParseUtil.C.parseCaipAddress(this.caipAddress):{},exchangeName=this.selectedExchange?.name;return this.selectedExchange?lit.qy`
        <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
          <wui-text variant="lg-regular" color="primary">${exchangeName}</wui-text>
          <wui-image src=${(0,if_defined.J)(this.selectedExchange.imageUrl)} size="mdl"></wui-image>
        </wui-flex>
      `:lit.qy`
      <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
        <wui-text variant="lg-regular" color="primary">
          ${esm_exports.Zv.getTruncateString({string:this.profileName||address||exchangeName||"",charsStart:this.profileName?16:4,charsEnd:this.profileName?0:6,truncate:this.profileName?"end":"middle"})}
        </wui-text>

        <wui-image src=${(0,if_defined.J)(image)} size="mdl"></wui-image>
      </wui-flex>
    `}getStepsWithStatus(){return"failure"===this.quoteStatus||"timeout"===this.quoteStatus||"refund"===this.quoteStatus?STEPS.map(step=>({...step,status:"failed"})):STEPS.map(step=>{const status=(STEP_COMPLETED_STATUSES[step.id]??[]).includes(this.quoteStatus)?"completed":"pending";return{...step,status}})}renderStep({title,icon,status}){const classes={"step-icon-box":!0,success:"completed"===status};return lit.qy`
      <wui-flex alignItems="center" gap="3">
        <wui-flex justifyContent="center" alignItems="center" class="step-icon-container">
          <wui-icon name=${icon} color="default" size="mdl"></wui-icon>

          <wui-flex alignItems="center" justifyContent="center" class=${(0,class_map.H)(classes)}>
            ${this.renderStatusIndicator(status)}
          </wui-flex>
        </wui-flex>

        <wui-text variant="md-regular" color="primary">${title}</wui-text>
      </wui-flex>
    `}renderStatusIndicator(status){return"completed"===status?lit.qy`<wui-icon size="sm" color="success" name="checkmark"></wui-icon>`:"failed"===status?lit.qy`<wui-icon size="sm" color="error" name="close"></wui-icon>`:"pending"===status?lit.qy`<wui-loading-spinner color="accent-primary" size="sm"></wui-loading-spinner>`:null}startPolling(){this.pollingInterval||(this.fetchQuoteStatus(),this.pollingInterval=setInterval(()=>{this.fetchQuoteStatus()},3e3))}stopPolling(){this.pollingInterval&&(clearInterval(this.pollingInterval),this.pollingInterval=null)}async fetchQuoteStatus(){const requestId=PayController.state.requestId;if(!requestId||TERMINAL_STATES.includes(this.quoteStatus))this.stopPolling();else try{await PayController.fetchQuoteStatus({requestId}),TERMINAL_STATES.includes(this.quoteStatus)&&this.stopPolling()}catch{this.stopPolling()}}initializeNamespace(){const namespace=ChainController.W.state.activeChain;this.namespace=namespace,this.caipAddress=ChainController.W.getAccountData(namespace)?.caipAddress,this.profileName=ChainController.W.getAccountData(namespace)?.profileName??null,this.unsubscribe.push(ChainController.W.subscribeChainProp("accountState",accountState=>{this.caipAddress=accountState?.caipAddress,this.profileName=accountState?.profileName??null},namespace))}getWalletProperties({namespace}){if(!namespace)return{name:void 0,image:void 0};const connectorId=this.activeConnectorIds[namespace];if(!connectorId)return{name:void 0,image:void 0};const connector=ConnectorController.a.getConnector({id:connectorId,namespace});if(!connector)return{name:void 0,image:void 0};const connectorImage=AssetUtil.$.getConnectorImage(connector);return{name:connector.name,image:connectorImage}}};W3mPayLoadingView.styles=w3m_pay_loading_view_styles,w3m_pay_loading_view_decorate([(0,decorators.wk)()],W3mPayLoadingView.prototype,"paymentAsset",void 0),w3m_pay_loading_view_decorate([(0,decorators.wk)()],W3mPayLoadingView.prototype,"quoteStatus",void 0),w3m_pay_loading_view_decorate([(0,decorators.wk)()],W3mPayLoadingView.prototype,"quote",void 0),w3m_pay_loading_view_decorate([(0,decorators.wk)()],W3mPayLoadingView.prototype,"amount",void 0),w3m_pay_loading_view_decorate([(0,decorators.wk)()],W3mPayLoadingView.prototype,"namespace",void 0),w3m_pay_loading_view_decorate([(0,decorators.wk)()],W3mPayLoadingView.prototype,"caipAddress",void 0),w3m_pay_loading_view_decorate([(0,decorators.wk)()],W3mPayLoadingView.prototype,"profileName",void 0),w3m_pay_loading_view_decorate([(0,decorators.wk)()],W3mPayLoadingView.prototype,"activeConnectorIds",void 0),w3m_pay_loading_view_decorate([(0,decorators.wk)()],W3mPayLoadingView.prototype,"selectedExchange",void 0),W3mPayLoadingView=w3m_pay_loading_view_decorate([(0,esm_exports.EM)("w3m-pay-loading-view")],W3mPayLoadingView);var UiHelperUtil=__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/utils/UiHelperUtil.js");const wui_wallet_switch_styles=ThemeHelperUtil.AH`
  button {
    display: flex;
    align-items: center;
    height: 40px;
    padding: ${({spacing})=>spacing[2]};
    border-radius: ${({borderRadius})=>borderRadius[4]};
    column-gap: ${({spacing})=>spacing[1]};
    background-color: transparent;
    transition: background-color ${({durations})=>durations.lg}
      ${({easings})=>easings["ease-out-power-2"]};
    will-change: background-color;
  }

  wui-image,
  .icon-box {
    width: ${({spacing})=>spacing[6]};
    height: ${({spacing})=>spacing[6]};
    border-radius: ${({borderRadius})=>borderRadius[4]};
  }

  wui-text {
    flex: 1;
  }

  .icon-box {
    position: relative;
  }

  .icon-box[data-active='true'] {
    background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
  }

  .circle {
    position: absolute;
    left: 16px;
    top: 15px;
    width: 8px;
    height: 8px;
    background-color: ${({tokens})=>tokens.core.textSuccess};
    box-shadow: 0 0 0 2px ${({tokens})=>tokens.theme.foregroundPrimary};
    border-radius: 50%;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
    }
  }
`;var wui_wallet_switch_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let WuiWalletSwitch=class WuiWalletSwitch extends lit.WF{constructor(){super(...arguments),this.address="",this.profileName="",this.alt="",this.imageSrc="",this.icon=void 0,this.iconSize="md",this.enableGreenCircle=!0,this.loading=!1,this.charsStart=4,this.charsEnd=6}render(){return lit.qy`
      <button>
        ${this.leftImageTemplate()} ${this.textTemplate()} ${this.rightImageTemplate()}
      </button>
    `}leftImageTemplate(){const imageOrIconContent=this.icon?lit.qy`<wui-icon
          size=${(0,if_defined.J)(this.iconSize)}
          color="default"
          name=${this.icon}
          class="icon"
        ></wui-icon>`:lit.qy`<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`;return lit.qy`
      <wui-flex
        alignItems="center"
        justifyContent="center"
        class="icon-box"
        data-active=${Boolean(this.icon)}
      >
        ${imageOrIconContent}
        ${this.enableGreenCircle?lit.qy`<wui-flex class="circle"></wui-flex>`:null}
      </wui-flex>
    `}textTemplate(){return lit.qy`
      <wui-text variant="lg-regular" color="primary">
        ${UiHelperUtil.Z.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?16:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?"end":"middle"})}
      </wui-text>
    `}rightImageTemplate(){return lit.qy`<wui-icon name="chevronBottom" size="sm" color="default"></wui-icon>`}};WuiWalletSwitch.styles=[ThemeUtil.W5,ThemeUtil.fD,wui_wallet_switch_styles],wui_wallet_switch_decorate([(0,decorators.MZ)()],WuiWalletSwitch.prototype,"address",void 0),wui_wallet_switch_decorate([(0,decorators.MZ)()],WuiWalletSwitch.prototype,"profileName",void 0),wui_wallet_switch_decorate([(0,decorators.MZ)()],WuiWalletSwitch.prototype,"alt",void 0),wui_wallet_switch_decorate([(0,decorators.MZ)()],WuiWalletSwitch.prototype,"imageSrc",void 0),wui_wallet_switch_decorate([(0,decorators.MZ)()],WuiWalletSwitch.prototype,"icon",void 0),wui_wallet_switch_decorate([(0,decorators.MZ)()],WuiWalletSwitch.prototype,"iconSize",void 0),wui_wallet_switch_decorate([(0,decorators.MZ)({type:Boolean})],WuiWalletSwitch.prototype,"enableGreenCircle",void 0),wui_wallet_switch_decorate([(0,decorators.MZ)({type:Boolean})],WuiWalletSwitch.prototype,"loading",void 0),wui_wallet_switch_decorate([(0,decorators.MZ)({type:Number})],WuiWalletSwitch.prototype,"charsStart",void 0),wui_wallet_switch_decorate([(0,decorators.MZ)({type:Number})],WuiWalletSwitch.prototype,"charsEnd",void 0),WuiWalletSwitch=wui_wallet_switch_decorate([(0,WebComponentsUtil.E)("wui-wallet-switch")],WuiWalletSwitch);__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/wui-shimmer.js");const w3m_pay_fees_skeleton_styles=lit.AH`
  :host {
    display: block;
  }
`;var w3m_pay_fees_skeleton_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mPayFeesSkeleton=class W3mPayFeesSkeleton extends lit.WF{render(){return lit.qy`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-shimmer width="60px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Network Fee</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-shimmer
              width="75px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>

            <wui-flex alignItems="center" gap="01">
              <wui-shimmer width="14px" height="14px" rounded variant="light"></wui-shimmer>
              <wui-shimmer
                width="49px"
                height="14px"
                borderRadius="4xs"
                variant="light"
              ></wui-shimmer>
            </wui-flex>
          </wui-flex>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Service Fee</wui-text>
          <wui-shimmer width="75px" height="16px" borderRadius="4xs" variant="light"></wui-shimmer>
        </wui-flex>
      </wui-flex>
    `}};W3mPayFeesSkeleton.styles=[w3m_pay_fees_skeleton_styles],W3mPayFeesSkeleton=w3m_pay_fees_skeleton_decorate([(0,esm_exports.EM)("w3m-pay-fees-skeleton")],W3mPayFeesSkeleton);const w3m_pay_fees_styles=esm_exports.AH`
  :host {
    display: block;
  }

  wui-image {
    border-radius: ${({borderRadius})=>borderRadius.round};
  }
`;var w3m_pay_fees_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mPayFees=class W3mPayFees extends lit.WF{constructor(){super(),this.unsubscribe=[],this.quote=PayController.state.quote,this.unsubscribe.push(PayController.subscribeKey("quote",val=>this.quote=val))}disconnectedCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe())}render(){const amount=NumberUtil.S.formatNumber(this.quote?.origin.amount||"0",{decimals:this.quote?.origin.currency.metadata.decimals??0,round:6}).toString();return lit.qy`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-text variant="md-regular" color="primary">
            ${amount} ${this.quote?.origin.currency.metadata.symbol||"Unknown"}
          </wui-text>
        </wui-flex>

        ${this.quote&&this.quote.fees.length>0?this.quote.fees.map(fee=>this.renderFee(fee)):null}
      </wui-flex>
    `}renderFee(fee){const isNetworkFee="network"===fee.id,feeAmount=NumberUtil.S.formatNumber(fee.amount||"0",{decimals:fee.currency.metadata.decimals??0,round:6}).toString();if(isNetworkFee){const targetNetwork=ChainController.W.getAllRequestedCaipNetworks().find(net=>HelpersUtil.y.isLowerCaseMatch(net.caipNetworkId,fee.currency.network));return lit.qy`
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">${fee.label}</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-text variant="md-regular" color="primary">
              ${feeAmount} ${fee.currency.metadata.symbol||"Unknown"}
            </wui-text>

            <wui-flex alignItems="center" gap="01">
              <wui-image
                src=${(0,if_defined.J)(AssetUtil.$.getNetworkImage(targetNetwork))}
                size="xs"
              ></wui-image>
              <wui-text variant="sm-regular" color="secondary">
                ${targetNetwork?.name||"Unknown"}
              </wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      `}return lit.qy`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-text variant="md-regular" color="secondary">${fee.label}</wui-text>
        <wui-text variant="md-regular" color="primary">
          ${feeAmount} ${fee.currency.metadata.symbol||"Unknown"}
        </wui-text>
      </wui-flex>
    `}};W3mPayFees.styles=[w3m_pay_fees_styles],w3m_pay_fees_decorate([(0,decorators.wk)()],W3mPayFees.prototype,"quote",void 0),W3mPayFees=w3m_pay_fees_decorate([(0,esm_exports.EM)("w3m-pay-fees")],W3mPayFees);const w3m_pay_options_empty_styles=esm_exports.AH`
  :host {
    display: block;
    width: 100%;
  }

  .disabled-container {
    padding: ${({spacing})=>spacing[2]};
    min-height: 168px;
  }

  wui-icon {
    width: ${({spacing})=>spacing[8]};
    height: ${({spacing})=>spacing[8]};
  }

  wui-flex > wui-text {
    max-width: 273px;
  }
`;var w3m_pay_options_empty_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mPayOptionsEmpty=class W3mPayOptionsEmpty extends lit.WF{constructor(){super(),this.unsubscribe=[],this.selectedExchange=PayController.state.selectedExchange,this.unsubscribe.push(PayController.subscribeKey("selectedExchange",val=>this.selectedExchange=val))}disconnectedCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe())}render(){const isUsingExchange=Boolean(this.selectedExchange);return lit.qy`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
        class="disabled-container"
      >
        <wui-icon name="coins" color="default" size="inherit"></wui-icon>

        <wui-text variant="md-regular" color="primary" align="center">
          You don't have enough funds to complete this transaction
        </wui-text>

        ${isUsingExchange?null:lit.qy`<wui-button
              size="md"
              variant="neutral-secondary"
              @click=${this.dispatchConnectOtherWalletEvent.bind(this)}
              >Connect other wallet</wui-button
            >`}
      </wui-flex>
    `}dispatchConnectOtherWalletEvent(){this.dispatchEvent(new CustomEvent("connectOtherWallet",{detail:!0,bubbles:!0,composed:!0}))}};W3mPayOptionsEmpty.styles=[w3m_pay_options_empty_styles],w3m_pay_options_empty_decorate([(0,decorators.MZ)({type:Array})],W3mPayOptionsEmpty.prototype,"selectedExchange",void 0),W3mPayOptionsEmpty=w3m_pay_options_empty_decorate([(0,esm_exports.EM)("w3m-pay-options-empty")],W3mPayOptionsEmpty);const w3m_pay_options_skeleton_styles=esm_exports.AH`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    border-radius: ${({borderRadius})=>borderRadius[4]};
    padding: ${({spacing})=>spacing[3]};
    min-height: 60px;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .chain-image {
    position: absolute;
    bottom: -3px;
    right: -5px;
    border: 2px solid ${({tokens})=>tokens.theme.foregroundSecondary};
  }
`;var w3m_pay_options_skeleton_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mPayOptionsSkeleton=class W3mPayOptionsSkeleton extends lit.WF{render(){return lit.qy`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.renderOptionEntry()} ${this.renderOptionEntry()} ${this.renderOptionEntry()}
      </wui-flex>
    `}renderOptionEntry(){return lit.qy`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-shimmer
              width="32px"
              height="32px"
              rounded
              variant="light"
              class="token-image"
            ></wui-shimmer>
            <wui-shimmer
              width="16px"
              height="16px"
              rounded
              variant="light"
              class="chain-image"
            ></wui-shimmer>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-shimmer
              width="74px"
              height="16px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
            <wui-shimmer
              width="46px"
              height="14px"
              borderRadius="4xs"
              variant="light"
            ></wui-shimmer>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}};W3mPayOptionsSkeleton.styles=[w3m_pay_options_skeleton_styles],W3mPayOptionsSkeleton=w3m_pay_options_skeleton_decorate([(0,esm_exports.EM)("w3m-pay-options-skeleton")],W3mPayOptionsSkeleton);const w3m_pay_options_styles=esm_exports.AH`
  :host {
    display: block;
    width: 100%;
  }

  .pay-options-container {
    max-height: 196px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    mask-image: var(--options-mask-image);
    -webkit-mask-image: var(--options-mask-image);
  }

  .pay-options-container::-webkit-scrollbar {
    display: none;
  }

  .pay-option-container {
    cursor: pointer;
    border-radius: ${({borderRadius})=>borderRadius[4]};
    padding: ${({spacing})=>spacing[3]};
    transition: background-color ${({durations})=>durations.lg}
      ${({easings})=>easings["ease-out-power-1"]};
    will-change: background-color;
  }

  .token-images-container {
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .token-image {
    border-radius: ${({borderRadius})=>borderRadius.round};
    width: 32px;
    height: 32px;
  }

  .chain-image {
    position: absolute;
    width: 16px;
    height: 16px;
    bottom: -3px;
    right: -5px;
    border-radius: ${({borderRadius})=>borderRadius.round};
    border: 2px solid ${({tokens})=>tokens.theme.backgroundPrimary};
  }

  @media (hover: hover) and (pointer: fine) {
    .pay-option-container:hover {
      background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
    }
  }
`;var w3m_pay_options_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mPayOptions=class W3mPayOptions extends lit.WF{constructor(){super(),this.unsubscribe=[],this.options=[],this.selectedPaymentAsset=null}disconnectedCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe()),this.resizeObserver?.disconnect();const optionsEl=this.shadowRoot?.querySelector(".pay-options-container");optionsEl?.removeEventListener("scroll",this.handleOptionsListScroll.bind(this))}firstUpdated(){const optionsEl=this.shadowRoot?.querySelector(".pay-options-container");optionsEl&&(requestAnimationFrame(this.handleOptionsListScroll.bind(this)),optionsEl?.addEventListener("scroll",this.handleOptionsListScroll.bind(this)),this.resizeObserver=new ResizeObserver(()=>{this.handleOptionsListScroll()}),this.resizeObserver?.observe(optionsEl),this.handleOptionsListScroll())}render(){return lit.qy`
      <wui-flex flexDirection="column" gap="2" class="pay-options-container">
        ${this.options.map(option=>this.payOptionTemplate(option))}
      </wui-flex>
    `}payOptionTemplate(paymentAsset){const{network,metadata,asset,amount="0"}=paymentAsset,targetNetwork=ChainController.W.getAllRequestedCaipNetworks().find(net=>net.caipNetworkId===network),isSelected=`${network}:${asset}`===`${this.selectedPaymentAsset?.network}:${this.selectedPaymentAsset?.asset}`,bigAmount=NumberUtil.S.bigNumber(amount,{safe:!0}),hasEnoughBalance=bigAmount.gt(0);return lit.qy`
      <wui-flex
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        @click=${()=>this.onSelect?.(paymentAsset)}
        class="pay-option-container"
      >
        <wui-flex alignItems="center" gap="2">
          <wui-flex class="token-images-container">
            <wui-image
              src=${(0,if_defined.J)(metadata.logoURI)}
              class="token-image"
              size="3xl"
            ></wui-image>
            <wui-image
              src=${(0,if_defined.J)(AssetUtil.$.getNetworkImage(targetNetwork))}
              class="chain-image"
              size="md"
            ></wui-image>
          </wui-flex>

          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="lg-regular" color="primary">${metadata.symbol}</wui-text>
            ${hasEnoughBalance?lit.qy`<wui-text variant="sm-regular" color="secondary">
                  ${bigAmount.round(6).toString()} ${metadata.symbol}
                </wui-text>`:null}
          </wui-flex>
        </wui-flex>

        ${isSelected?lit.qy`<wui-icon name="checkmark" size="md" color="success"></wui-icon>`:null}
      </wui-flex>
    `}handleOptionsListScroll(){const optionsEl=this.shadowRoot?.querySelector(".pay-options-container");if(!optionsEl)return;optionsEl.scrollHeight>300?(optionsEl.style.setProperty("--options-mask-image","linear-gradient(\n          to bottom,\n          rgba(0, 0, 0, calc(1 - var(--options-scroll--top-opacity))) 0px,\n          rgba(200, 200, 200, calc(1 - var(--options-scroll--top-opacity))) 1px,\n          black 50px,\n          black calc(100% - 50px),\n          rgba(155, 155, 155, calc(1 - var(--options-scroll--bottom-opacity))) calc(100% - 1px),\n          rgba(0, 0, 0, calc(1 - var(--options-scroll--bottom-opacity))) 100%\n        )"),optionsEl.style.setProperty("--options-scroll--top-opacity",esm_exports.z8.interpolate([0,50],[0,1],optionsEl.scrollTop).toString()),optionsEl.style.setProperty("--options-scroll--bottom-opacity",esm_exports.z8.interpolate([0,50],[0,1],optionsEl.scrollHeight-optionsEl.scrollTop-optionsEl.offsetHeight).toString())):(optionsEl.style.setProperty("--options-mask-image","none"),optionsEl.style.setProperty("--options-scroll--top-opacity","0"),optionsEl.style.setProperty("--options-scroll--bottom-opacity","0"))}};W3mPayOptions.styles=[w3m_pay_options_styles],w3m_pay_options_decorate([(0,decorators.MZ)({type:Array})],W3mPayOptions.prototype,"options",void 0),w3m_pay_options_decorate([(0,decorators.MZ)()],W3mPayOptions.prototype,"selectedPaymentAsset",void 0),w3m_pay_options_decorate([(0,decorators.MZ)()],W3mPayOptions.prototype,"onSelect",void 0),W3mPayOptions=w3m_pay_options_decorate([(0,esm_exports.EM)("w3m-pay-options")],W3mPayOptions);const w3m_pay_quote_view_styles=esm_exports.AH`
  .payment-methods-container {
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
    border-top-right-radius: ${({borderRadius})=>borderRadius[5]};
    border-top-left-radius: ${({borderRadius})=>borderRadius[5]};
  }

  .pay-options-container {
    background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
    border-radius: ${({borderRadius})=>borderRadius[5]};
    padding: ${({spacing})=>spacing[1]};
  }

  w3m-tooltip-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: fit-content;
  }

  wui-image {
    border-radius: ${({borderRadius})=>borderRadius.round};
  }

  w3m-pay-options.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`;var w3m_pay_quote_view_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};const NAMESPACE_LABELS={eip155:{icon:"ethereum",label:"EVM"},solana:{icon:"solana",label:"Solana"},bip122:{icon:"bitcoin",label:"Bitcoin"},ton:{icon:"ton",label:"Ton"}};let W3mPayQuoteView=class W3mPayQuoteView extends lit.WF{constructor(){super(),this.unsubscribe=[],this.profileName=null,this.paymentAsset=PayController.state.paymentAsset,this.namespace=void 0,this.caipAddress=void 0,this.amount=PayController.state.amount,this.recipient=PayController.state.recipient,this.activeConnectorIds=ConnectorController.a.state.activeConnectorIds,this.selectedPaymentAsset=PayController.state.selectedPaymentAsset,this.selectedExchange=PayController.state.selectedExchange,this.isFetchingQuote=PayController.state.isFetchingQuote,this.quoteError=PayController.state.quoteError,this.quote=PayController.state.quote,this.isFetchingTokenBalances=PayController.state.isFetchingTokenBalances,this.tokenBalances=PayController.state.tokenBalances,this.isPaymentInProgress=PayController.state.isPaymentInProgress,this.exchangeUrlForQuote=PayController.state.exchangeUrlForQuote,this.completedTransactionsCount=0,this.unsubscribe.push(PayController.subscribeKey("paymentAsset",val=>this.paymentAsset=val)),this.unsubscribe.push(PayController.subscribeKey("tokenBalances",val=>this.onTokenBalancesChanged(val))),this.unsubscribe.push(PayController.subscribeKey("isFetchingTokenBalances",val=>this.isFetchingTokenBalances=val)),this.unsubscribe.push(ConnectorController.a.subscribeKey("activeConnectorIds",newActiveConnectorIds=>this.activeConnectorIds=newActiveConnectorIds)),this.unsubscribe.push(PayController.subscribeKey("selectedPaymentAsset",val=>this.selectedPaymentAsset=val)),this.unsubscribe.push(PayController.subscribeKey("isFetchingQuote",val=>this.isFetchingQuote=val)),this.unsubscribe.push(PayController.subscribeKey("quoteError",val=>this.quoteError=val)),this.unsubscribe.push(PayController.subscribeKey("quote",val=>this.quote=val)),this.unsubscribe.push(PayController.subscribeKey("amount",val=>this.amount=val)),this.unsubscribe.push(PayController.subscribeKey("recipient",val=>this.recipient=val)),this.unsubscribe.push(PayController.subscribeKey("isPaymentInProgress",val=>this.isPaymentInProgress=val)),this.unsubscribe.push(PayController.subscribeKey("selectedExchange",val=>this.selectedExchange=val)),this.unsubscribe.push(PayController.subscribeKey("exchangeUrlForQuote",val=>this.exchangeUrlForQuote=val)),this.resetQuoteState(),this.initializeNamespace(),this.fetchTokens()}disconnectedCallback(){super.disconnectedCallback(),this.resetAssetsState(),this.unsubscribe.forEach(unsubscribe=>unsubscribe())}updated(changedProperties){super.updated(changedProperties);changedProperties.has("selectedPaymentAsset")&&this.fetchQuote()}render(){return lit.qy`
      <wui-flex flexDirection="column">
        ${this.profileTemplate()}

        <wui-flex
          flexDirection="column"
          gap="4"
          class="payment-methods-container"
          .padding=${["4","4","5","4"]}
        >
          ${this.paymentOptionsViewTemplate()} ${this.amountWithFeeTemplate()}

          <wui-flex
            alignItems="center"
            justifyContent="space-between"
            .padding=${["1","0","1","0"]}
          >
            <wui-separator></wui-separator>
          </wui-flex>

          ${this.paymentActionsTemplate()}
        </wui-flex>
      </wui-flex>
    `}profileTemplate(){if(this.selectedExchange){const amount=NumberUtil.S.formatNumber(this.quote?.origin.amount,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return lit.qy`
        <wui-flex
          .padding=${["4","3","4","3"]}
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-text variant="lg-regular" color="secondary">Paying with</wui-text>

          ${this.quote?lit.qy`<wui-text variant="lg-regular" color="primary">
                ${NumberUtil.S.bigNumber(amount,{safe:!0}).round(6).toString()}
                ${this.quote.origin.currency.metadata.symbol}
              </wui-text>`:lit.qy`<wui-shimmer width="80px" height="18px" variant="light"></wui-shimmer>`}
        </wui-flex>
      `}const address=CoreHelperUtil.w.getPlainAddress(this.caipAddress)??"",{name,image}=this.getWalletProperties({namespace:this.namespace}),{icon:chainIcon,label:chainLabel}=NAMESPACE_LABELS[this.namespace]??{};return lit.qy`
      <wui-flex
        .padding=${["4","3","4","3"]}
        alignItems="center"
        justifyContent="space-between"
        gap="2"
      >
        <wui-wallet-switch
          profileName=${(0,if_defined.J)(this.profileName)}
          address=${(0,if_defined.J)(address)}
          imageSrc=${(0,if_defined.J)(image)}
          alt=${(0,if_defined.J)(name)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        <wui-wallet-switch
          profileName=${(0,if_defined.J)(chainLabel)}
          address=${(0,if_defined.J)(address)}
          icon=${(0,if_defined.J)(chainIcon)}
          iconSize="xs"
          .enableGreenCircle=${!1}
          alt=${(0,if_defined.J)(chainLabel)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
      </wui-flex>
    `}initializeNamespace(){const namespace=ChainController.W.state.activeChain;this.namespace=namespace,this.caipAddress=ChainController.W.getAccountData(namespace)?.caipAddress,this.profileName=ChainController.W.getAccountData(namespace)?.profileName??null,this.unsubscribe.push(ChainController.W.subscribeChainProp("accountState",accountState=>this.onAccountStateChanged(accountState),namespace))}async fetchTokens(){if(this.namespace){let caipNetwork;if(this.caipAddress){const{chainId,chainNamespace}=ParseUtil.C.parseCaipAddress(this.caipAddress),caipNetworkId=`${chainNamespace}:${chainId}`;caipNetwork=ChainController.W.getAllRequestedCaipNetworks().find(net=>net.caipNetworkId===caipNetworkId)}await PayController.fetchTokens({caipAddress:this.caipAddress,caipNetwork,namespace:this.namespace})}}fetchQuote(){if(this.amount&&this.recipient&&this.selectedPaymentAsset&&this.paymentAsset){const{address}=this.caipAddress?ParseUtil.C.parseCaipAddress(this.caipAddress):{};PayController.fetchQuote({amount:this.amount.toString(),address,sourceToken:this.selectedPaymentAsset,toToken:this.paymentAsset,recipient:this.recipient})}}getWalletProperties({namespace}){if(!namespace)return{name:void 0,image:void 0};const connectorId=this.activeConnectorIds[namespace];if(!connectorId)return{name:void 0,image:void 0};const connector=ConnectorController.a.getConnector({id:connectorId,namespace});if(!connector)return{name:void 0,image:void 0};const connectorImage=AssetUtil.$.getConnectorImage(connector);return{name:connector.name,image:connectorImage}}paymentOptionsViewTemplate(){return lit.qy`
      <wui-flex flexDirection="column" gap="2">
        <wui-text variant="sm-regular" color="secondary">CHOOSE PAYMENT OPTION</wui-text>
        <wui-flex class="pay-options-container">${this.paymentOptionsTemplate()}</wui-flex>
      </wui-flex>
    `}paymentOptionsTemplate(){const paymentAssets=this.getPaymentAssetFromTokenBalances();if(this.isFetchingTokenBalances)return lit.qy`<w3m-pay-options-skeleton></w3m-pay-options-skeleton>`;if(0===paymentAssets.length)return lit.qy`<w3m-pay-options-empty
        @connectOtherWallet=${this.onConnectOtherWallet.bind(this)}
      ></w3m-pay-options-empty>`;const classes={disabled:this.isFetchingQuote};return lit.qy`<w3m-pay-options
      class=${(0,class_map.H)(classes)}
      .options=${paymentAssets}
      .selectedPaymentAsset=${(0,if_defined.J)(this.selectedPaymentAsset)}
      .onSelect=${this.onSelectedPaymentAssetChanged.bind(this)}
    ></w3m-pay-options>`}amountWithFeeTemplate(){return this.isFetchingQuote||!this.selectedPaymentAsset||this.quoteError?lit.qy`<w3m-pay-fees-skeleton></w3m-pay-fees-skeleton>`:lit.qy`<w3m-pay-fees></w3m-pay-fees>`}paymentActionsTemplate(){const isLoading=this.isFetchingQuote||this.isFetchingTokenBalances,isDisabled=this.isFetchingQuote||this.isFetchingTokenBalances||!this.selectedPaymentAsset||Boolean(this.quoteError),amount=NumberUtil.S.formatNumber(this.quote?.origin.amount??0,{decimals:this.quote?.origin.currency.metadata.decimals??0}).toString();return this.selectedExchange?isLoading||isDisabled?lit.qy`
          <wui-shimmer width="100%" height="48px" variant="light" ?rounded=${!0}></wui-shimmer>
        `:lit.qy`<wui-button
        size="lg"
        fullWidth
        variant="accent-secondary"
        @click=${this.onPayWithExchange.bind(this)}
      >
        ${`Continue in ${this.selectedExchange.name}`}

        <wui-icon name="arrowRight" color="inherit" size="sm" slot="iconRight"></wui-icon>
      </wui-button>`:lit.qy`
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="md-regular" color="secondary">Order Total</wui-text>

          ${isLoading||isDisabled?lit.qy`<wui-shimmer width="58px" height="32px" variant="light"></wui-shimmer>`:lit.qy`<wui-flex alignItems="center" gap="01">
                <wui-text variant="h4-regular" color="primary">${formatAmount(amount)}</wui-text>

                <wui-text variant="lg-regular" color="secondary">
                  ${this.quote?.origin.currency.metadata.symbol||"Unknown"}
                </wui-text>
              </wui-flex>`}
        </wui-flex>

        ${this.actionButtonTemplate({isLoading,isDisabled})}
      </wui-flex>
    `}actionButtonTemplate(params){const allTransactionSteps=getTransactionsSteps(this.quote),{isLoading,isDisabled}=params;let label="Pay";return allTransactionSteps.length>1&&0===this.completedTransactionsCount&&(label="Approve"),lit.qy`
      <wui-button
        size="lg"
        variant="accent-primary"
        ?loading=${isLoading||this.isPaymentInProgress}
        ?disabled=${isDisabled||this.isPaymentInProgress}
        @click=${()=>{allTransactionSteps.length>0?this.onSendTransactions():this.onTransfer()}}
      >
        ${label}
        ${isLoading?null:lit.qy`<wui-icon
              name="arrowRight"
              color="inherit"
              size="sm"
              slot="iconRight"
            ></wui-icon>`}
      </wui-button>
    `}getPaymentAssetFromTokenBalances(){if(!this.namespace)return[];return(this.tokenBalances[this.namespace]??[]).map(balance=>{try{return function formatBalanceToPaymentAsset(balance){const targetNetwork=ChainController.W.getAllRequestedCaipNetworks().find(net=>net.caipNetworkId===balance.chainId);let asset=balance.address;if(!targetNetwork)throw new Error(`Target network not found for balance chainId "${balance.chainId}"`);if(HelpersUtil.y.isLowerCaseMatch(balance.symbol,targetNetwork.nativeCurrency.symbol))asset="native";else if(CoreHelperUtil.w.isCaipAddress(asset)){const{address}=ParseUtil.C.parseCaipAddress(asset);asset=address}else if(!asset)throw new Error(`Balance address not found for balance symbol "${balance.symbol}"`);return{network:targetNetwork.caipNetworkId,asset,metadata:{name:balance.name,symbol:balance.symbol,decimals:Number(balance.quantity.decimals),logoURI:balance.iconUrl},amount:balance.quantity.numeric}}(balance)}catch(err){return null}}).filter(option=>Boolean(option)).filter(option=>{const{chainId:optionChainId}=ParseUtil.C.parseCaipNetworkId(option.network),{chainId:paymentAssetChainId}=ParseUtil.C.parseCaipNetworkId(this.paymentAsset.network);return!!HelpersUtil.y.isLowerCaseMatch(option.asset,this.paymentAsset.asset)||(!this.selectedExchange||!HelpersUtil.y.isLowerCaseMatch(optionChainId.toString(),paymentAssetChainId.toString()))})}onTokenBalancesChanged(tokenBalances){this.tokenBalances=tokenBalances;const[paymentAsset]=this.getPaymentAssetFromTokenBalances();paymentAsset&&PayController.setSelectedPaymentAsset(paymentAsset)}async onConnectOtherWallet(){await ConnectorController.a.connect(),await ModalController.W.open({view:"PayQuote"})}onAccountStateChanged(accountState){const{address:oldAddress}=this.caipAddress?ParseUtil.C.parseCaipAddress(this.caipAddress):{};if(this.caipAddress=accountState?.caipAddress,this.profileName=accountState?.profileName??null,oldAddress){const{address:newAddress}=this.caipAddress?ParseUtil.C.parseCaipAddress(this.caipAddress):{};newAddress?HelpersUtil.y.isLowerCaseMatch(newAddress,oldAddress)||(this.resetAssetsState(),this.resetQuoteState(),this.fetchTokens()):ModalController.W.close()}}onSelectedPaymentAssetChanged(paymentAsset){this.isFetchingQuote||PayController.setSelectedPaymentAsset(paymentAsset)}async onTransfer(){const transferStep=getTransferStep(this.quote);if(transferStep){if(!HelpersUtil.y.isLowerCaseMatch(this.selectedPaymentAsset?.asset,transferStep.deposit.currency))throw new Error("Quote asset is not the same as the selected payment asset");const currentAmount=this.selectedPaymentAsset?.amount??"0",amountToTransfer=NumberUtil.S.formatNumber(transferStep.deposit.amount,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!NumberUtil.S.bigNumber(currentAmount).gte(amountToTransfer))return void SnackController.P.showError("Insufficient funds");if(this.quote&&this.selectedPaymentAsset&&this.caipAddress&&this.namespace){const{address:fromAddress}=ParseUtil.C.parseCaipAddress(this.caipAddress);await PayController.onTransfer({chainNamespace:this.namespace,fromAddress,toAddress:transferStep.deposit.receiver,amount:amountToTransfer,paymentAsset:this.selectedPaymentAsset}),PayController.setRequestId(transferStep.requestId),RouterController.I.push("PayLoading")}}}async onSendTransactions(){const currentAmount=this.selectedPaymentAsset?.amount??"0",amountToSwap=NumberUtil.S.formatNumber(this.quote?.origin.amount??0,{decimals:this.selectedPaymentAsset?.metadata.decimals??0}).toString();if(!NumberUtil.S.bigNumber(currentAmount).gte(amountToSwap))return void SnackController.P.showError("Insufficient funds");const allTransactionSteps=getTransactionsSteps(this.quote),[transactionStep]=getTransactionsSteps(this.quote,this.completedTransactionsCount);if(transactionStep&&this.namespace){await PayController.onSendTransaction({namespace:this.namespace,transactionStep}),this.completedTransactionsCount+=1;this.completedTransactionsCount===allTransactionSteps.length&&(PayController.setRequestId(transactionStep.requestId),RouterController.I.push("PayLoading"))}}onPayWithExchange(){if(this.exchangeUrlForQuote){const popupWindow=CoreHelperUtil.w.returnOpenHref("","popupWindow","scrollbar=yes,width=480,height=720");if(!popupWindow)throw new Error("Could not create popup window");popupWindow.location.href=this.exchangeUrlForQuote;const transactionStep=getTransferStep(this.quote);transactionStep&&PayController.setRequestId(transactionStep.requestId),PayController.initiatePayment(),RouterController.I.push("PayLoading")}}resetAssetsState(){PayController.setSelectedPaymentAsset(null)}resetQuoteState(){PayController.resetQuoteState()}};W3mPayQuoteView.styles=w3m_pay_quote_view_styles,w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"profileName",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"paymentAsset",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"namespace",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"caipAddress",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"amount",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"recipient",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"activeConnectorIds",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"selectedPaymentAsset",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"selectedExchange",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"isFetchingQuote",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"quoteError",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"quote",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"isFetchingTokenBalances",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"tokenBalances",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"isPaymentInProgress",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"exchangeUrlForQuote",void 0),w3m_pay_quote_view_decorate([(0,decorators.wk)()],W3mPayQuoteView.prototype,"completedTransactionsCount",void 0),W3mPayQuoteView=w3m_pay_quote_view_decorate([(0,esm_exports.EM)("w3m-pay-quote-view")],W3mPayQuoteView);const w3m_pay_header_styles=esm_exports.AH`
  wui-image {
    border-radius: ${({borderRadius})=>borderRadius.round};
  }

  .transfers-badge {
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
    border: 1px solid ${({tokens})=>tokens.theme.foregroundSecondary};
    border-radius: ${({borderRadius})=>borderRadius[4]};
  }
`;var w3m_pay_header_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mPayHeader=class W3mPayHeader extends lit.WF{constructor(){super(),this.unsubscribe=[],this.paymentAsset=PayController.state.paymentAsset,this.amount=PayController.state.amount,this.unsubscribe.push(PayController.subscribeKey("paymentAsset",val=>{this.paymentAsset=val}),PayController.subscribeKey("amount",val=>{this.amount=val}))}disconnectedCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe())}render(){const targetNetwork=ChainController.W.getAllRequestedCaipNetworks().find(net=>net.caipNetworkId===this.paymentAsset.network);return lit.qy`<wui-flex
      alignItems="center"
      gap="1"
      .padding=${["1","2","1","1"]}
      class="transfers-badge"
    >
      <wui-image src=${(0,if_defined.J)(this.paymentAsset.metadata.logoURI)} size="xl"></wui-image>
      <wui-text variant="lg-regular" color="primary">
        ${this.amount} ${this.paymentAsset.metadata.symbol}
      </wui-text>
      <wui-text variant="sm-regular" color="secondary">
        on ${targetNetwork?.name??"Unknown"}
      </wui-text>
    </wui-flex>`}};W3mPayHeader.styles=[w3m_pay_header_styles],w3m_pay_header_decorate([(0,decorators.MZ)()],W3mPayHeader.prototype,"paymentAsset",void 0),w3m_pay_header_decorate([(0,decorators.MZ)()],W3mPayHeader.prototype,"amount",void 0),W3mPayHeader=w3m_pay_header_decorate([(0,esm_exports.EM)("w3m-pay-header")],W3mPayHeader);const w3m_header_styles=esm_exports.AH`
  :host {
    height: 60px;
  }

  :host > wui-flex {
    box-sizing: border-box;
    background-color: var(--local-header-background-color);
  }

  wui-text {
    background-color: var(--local-header-background-color);
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards ${({easings})=>easings["ease-out-power-2"]},
      slide-down-in 120ms forwards ${({easings})=>easings["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards ${({easings})=>easings["ease-out-power-2"]},
      slide-up-in 120ms forwards ${({easings})=>easings["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-icon-button[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;var w3m_header_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};const BETA_SCREENS=["SmartSessionList"],BACKGROUND_OVERRIDES={PayWithExchange:esm_exports.f.tokens.theme.foregroundPrimary};function headings(){const connectorName=RouterController.I.state.data?.connector?.name,walletName=RouterController.I.state.data?.wallet?.name,networkName=RouterController.I.state.data?.network?.name,name=walletName??connectorName,connectors=ConnectorController.a.getConnectors(),isEmail=1===connectors.length&&"w3m-email"===connectors[0]?.id,socialProvider=ChainController.W.getAccountData()?.socialProvider;return{Connect:`Connect ${isEmail?"Email":""} Wallet`,Create:"Create Wallet",ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:"All Wallets",ApproveTransaction:"Approve Transaction",BuyInProgress:"Buy",UsageExceeded:"Usage Exceeded",ConnectingExternal:name??"Connect Wallet",ConnectingWalletConnect:name??"WalletConnect",ConnectingWalletConnectBasic:"WalletConnect",ConnectingSiwe:"Sign In",Convert:"Convert",ConvertSelectToken:"Select token",ConvertPreview:"Preview Convert",Downloads:name?`Get ${name}`:"Downloads",EmailLogin:"Email Login",EmailVerifyOtp:"Confirm Email",EmailVerifyDevice:"Register Device",GetWallet:"Get a Wallet",Networks:"Choose Network",OnRampProviders:"Choose Provider",OnRampActivity:"Activity",OnRampTokenSelect:"Select Token",OnRampFiatSelect:"Select Currency",Pay:"How you pay",ProfileWallets:"Wallets",SwitchNetwork:networkName??"Switch Network",Transactions:"Activity",UnsupportedChain:"Switch Network",UpgradeEmailWallet:"Upgrade Your Wallet",UpdateEmailWallet:"Edit Email",UpdateEmailPrimaryOtp:"Confirm Current Email",UpdateEmailSecondaryOtp:"Confirm New Email",WhatIsABuy:"What is Buy?",RegisterAccountName:"Choose Name",RegisterAccountNameSuccess:"",WalletReceive:"Receive",WalletCompatibleNetworks:"Compatible Networks",Swap:"Swap",SwapSelectToken:"Select Token",SwapPreview:"Preview Swap",WalletSend:"Send",WalletSendPreview:"Review Send",WalletSendSelectToken:"Select Token",WalletSendConfirmed:"Confirmed",WhatIsANetwork:"What is a network?",WhatIsAWallet:"What is a Wallet?",ConnectWallets:"Connect Wallet",ConnectSocials:"All Socials",ConnectingSocial:socialProvider?socialProvider.charAt(0).toUpperCase()+socialProvider.slice(1):"Connect Social",ConnectingMultiChain:"Select Chain",ConnectingFarcaster:"Farcaster",SwitchActiveChain:"Switch Chain",SmartSessionCreated:void 0,SmartSessionList:"Smart Sessions",SIWXSignMessage:"Sign In",PayLoading:"Processing payment...",PayQuote:"Payment Quote",DataCapture:"Profile",DataCaptureOtpConfirm:"Confirm Email",FundWallet:"Fund Wallet",PayWithExchange:"Deposit from Exchange",PayWithExchangeSelectAsset:"Select Asset",SmartAccountSettings:"Smart Account Settings"}}let W3mHeader=class W3mHeader extends lit.WF{constructor(){super(),this.unsubscribe=[],this.heading=headings()[RouterController.I.state.view],this.network=ChainController.W.state.activeCaipNetwork,this.networkImage=AssetUtil.$.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=RouterController.I.state.view,this.viewDirection="",this.unsubscribe.push(AssetController.j.subscribeNetworkImages(()=>{this.networkImage=AssetUtil.$.getNetworkImage(this.network)}),RouterController.I.subscribeKey("view",val=>{setTimeout(()=>{this.view=val,this.heading=headings()[val]},ConstantsUtil_ConstantsUtil.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),ChainController.W.subscribeKey("activeCaipNetwork",val=>{this.network=val,this.networkImage=AssetUtil.$.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe())}render(){const backgroundColor=BACKGROUND_OVERRIDES[RouterController.I.state.view]??esm_exports.f.tokens.theme.backgroundPrimary;return this.style.setProperty("--local-header-background-color",backgroundColor),lit.qy`
      <wui-flex
        .padding=${["0","4","0","4"]}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){EventsController.E.sendEvent({type:"track",event:"CLICK_WALLET_HELP"}),RouterController.I.push("WhatIsAWallet")}async onClose(){await ModalUtil.safeClose()}rightHeaderTemplate(){const isSmartSessionsEnabled=OptionsController.H?.state?.features?.smartSessions;return"Account"===RouterController.I.state.view&&isSmartSessionsEnabled?lit.qy`<wui-flex>
      <wui-icon-button
        icon="clock"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${()=>RouterController.I.push("SmartSessionList")}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-button>
      ${this.closeButtonTemplate()}
    </wui-flex> `:this.closeButtonTemplate()}closeButtonTemplate(){return lit.qy`
      <wui-icon-button
        icon="close"
        size="lg"
        type="neutral"
        variant="primary"
        iconSize="lg"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-button>
    `}titleTemplate(){if("PayQuote"===this.view)return lit.qy`<w3m-pay-header></w3m-pay-header>`;const isBeta=BETA_SCREENS.includes(this.view);return lit.qy`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="2"
      >
        <wui-text
          display="inline"
          variant="lg-regular"
          color="primary"
          data-testid="w3m-header-text"
        >
          ${this.heading}
        </wui-text>
        ${isBeta?lit.qy`<wui-tag variant="accent" size="md">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){const{view}=RouterController.I.state,isConnectHelp="Connect"===view,isEmbeddedEnable=OptionsController.H.state.enableEmbedded,isApproveTransaction="ApproveTransaction"===view,isConnectingSIWEView="ConnectingSiwe"===view,isAccountView="Account"===view,enableNetworkSwitch=OptionsController.H.state.enableNetworkSwitch,shouldHideBack=isApproveTransaction||isConnectingSIWEView||isConnectHelp&&isEmbeddedEnable;return isAccountView&&enableNetworkSwitch?lit.qy`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${(0,if_defined.J)(this.network?.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${(0,if_defined.J)(this.networkImage)}
      ></wui-select>`:this.showBack&&!shouldHideBack?lit.qy`<wui-icon-button
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-button>`:lit.qy`<wui-icon-button
      data-hidden=${!isConnectHelp}
      id="dynamic"
      icon="helpCircle"
      size="lg"
      iconSize="lg"
      type="neutral"
      variant="primary"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-button>`}onNetworks(){this.isAllowedNetworkSwitch()&&(EventsController.E.sendEvent({type:"track",event:"CLICK_NETWORKS"}),RouterController.I.push("Networks"))}isAllowedNetworkSwitch(){const requestedCaipNetworks=ChainController.W.getAllRequestedCaipNetworks(),isMultiNetwork=!!requestedCaipNetworks&&requestedCaipNetworks.length>1,isValidNetwork=requestedCaipNetworks?.find(({id})=>id===this.network?.id);return isMultiNetwork||!isValidNetwork}onViewChange(){const{history}=RouterController.I.state;let direction=ConstantsUtil_ConstantsUtil.VIEW_DIRECTION.Next;history.length<this.prevHistoryLength&&(direction=ConstantsUtil_ConstantsUtil.VIEW_DIRECTION.Prev),this.prevHistoryLength=history.length,this.viewDirection=direction}async onHistoryChange(){const{history}=RouterController.I.state,buttonEl=this.shadowRoot?.querySelector("#dynamic");history.length>1&&!this.showBack&&buttonEl?(await buttonEl.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!0,buttonEl.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"})):history.length<=1&&this.showBack&&buttonEl&&(await buttonEl.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!1,buttonEl.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}onGoBack(){RouterController.I.goBack()}};W3mHeader.styles=w3m_header_styles,w3m_header_decorate([(0,decorators.wk)()],W3mHeader.prototype,"heading",void 0),w3m_header_decorate([(0,decorators.wk)()],W3mHeader.prototype,"network",void 0),w3m_header_decorate([(0,decorators.wk)()],W3mHeader.prototype,"networkImage",void 0),w3m_header_decorate([(0,decorators.wk)()],W3mHeader.prototype,"showBack",void 0),w3m_header_decorate([(0,decorators.wk)()],W3mHeader.prototype,"prevHistoryLength",void 0),w3m_header_decorate([(0,decorators.wk)()],W3mHeader.prototype,"view",void 0),w3m_header_decorate([(0,decorators.wk)()],W3mHeader.prototype,"viewDirection",void 0),W3mHeader=w3m_header_decorate([(0,esm_exports.EM)("w3m-header")],W3mHeader);__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/components/wui-loading-spinner/index.js"),__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/src/composites/wui-icon-box/index.js");const wui_snackbar_styles=ThemeHelperUtil.AH`
  :host {
    display: flex;
    align-items: center;
    gap: ${({spacing})=>spacing[1]};
    padding: ${({spacing})=>spacing[2]} ${({spacing})=>spacing[3]}
      ${({spacing})=>spacing[2]} ${({spacing})=>spacing[2]};
    border-radius: ${({borderRadius})=>borderRadius[20]};
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
    box-shadow:
      0px 0px 8px 0px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px ${({tokens})=>tokens.theme.borderPrimary};
    max-width: 320px;
  }

  wui-icon-box {
    border-radius: ${({borderRadius})=>borderRadius.round} !important;
    overflow: hidden;
  }

  wui-loading-spinner {
    padding: ${({spacing})=>spacing[1]};
    background-color: ${({tokens})=>tokens.core.foregroundAccent010};
    border-radius: ${({borderRadius})=>borderRadius.round} !important;
  }
`;var wui_snackbar_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let WuiSnackbar=class WuiSnackbar extends lit.WF{constructor(){super(...arguments),this.message="",this.variant="success"}render(){return lit.qy`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){return"loading"===this.variant?lit.qy`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:lit.qy`<wui-icon-box
      size="md"
      color=${{success:"success",error:"error",warning:"warning",info:"default"}[this.variant]}
      icon=${{success:"checkmark",error:"warning",warning:"warningCircle",info:"info"}[this.variant]}
    ></wui-icon-box>`}};WuiSnackbar.styles=[ThemeUtil.W5,wui_snackbar_styles],wui_snackbar_decorate([(0,decorators.MZ)()],WuiSnackbar.prototype,"message",void 0),wui_snackbar_decorate([(0,decorators.MZ)()],WuiSnackbar.prototype,"variant",void 0),WuiSnackbar=wui_snackbar_decorate([(0,WebComponentsUtil.E)("wui-snackbar")],WuiSnackbar);const w3m_snackbar_styles=lit.AH`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`;var w3m_snackbar_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mSnackBar=class W3mSnackBar extends lit.WF{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=SnackController.P.state.open,this.unsubscribe.push(SnackController.P.subscribeKey("open",val=>{this.open=val,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(unsubscribe=>unsubscribe())}render(){const{message,variant}=SnackController.P.state;return lit.qy` <wui-snackbar message=${message} variant=${variant}></wui-snackbar> `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:"translateX(-50%) scale(0.85)"},{opacity:1,transform:"translateX(-50%) scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.timeout&&clearTimeout(this.timeout),SnackController.P.state.autoClose&&(this.timeout=setTimeout(()=>SnackController.P.hide(),2500))):this.animate([{opacity:1,transform:"translateX(-50%) scale(1)"},{opacity:0,transform:"translateX(-50%) scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"})}};W3mSnackBar.styles=w3m_snackbar_styles,w3m_snackbar_decorate([(0,decorators.wk)()],W3mSnackBar.prototype,"open",void 0),W3mSnackBar=w3m_snackbar_decorate([(0,esm_exports.EM)("w3m-snackbar")],W3mSnackBar);const TooltipController_state=(0,vanilla.BX)({message:"",open:!1,triggerRect:{width:0,height:0,top:0,left:0},variant:"shade"}),TooltipController_controller={state:TooltipController_state,subscribe:callback=>(0,vanilla.B1)(TooltipController_state,()=>callback(TooltipController_state)),subscribeKey:(key,callback)=>(0,utils.u$)(TooltipController_state,key,callback),showTooltip({message,triggerRect,variant}){TooltipController_state.open=!0,TooltipController_state.message=message,TooltipController_state.triggerRect=triggerRect,TooltipController_state.variant=variant},hide(){TooltipController_state.open=!1,TooltipController_state.message="",TooltipController_state.triggerRect={width:0,height:0,top:0,left:0}}},TooltipController=(0,withErrorBoundary.X)(TooltipController_controller),w3m_tooltip_trigger_styles=lit.AH`
  :host {
    width: 100%;
    display: block;
  }
`;var w3m_tooltip_trigger_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let WuiTooltipTrigger=class WuiTooltipTrigger extends lit.WF{constructor(){super(),this.unsubscribe=[],this.text="",this.open=TooltipController.state.open,this.unsubscribe.push(RouterController.I.subscribeKey("view",()=>{TooltipController.hide()}),ModalController.W.subscribeKey("open",modalOpen=>{modalOpen||TooltipController.hide()}),TooltipController.subscribeKey("open",tooltipOpen=>{this.open=tooltipOpen}))}disconnectedCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe()),TooltipController.hide()}render(){return lit.qy`
      <div
        @pointermove=${this.onMouseEnter.bind(this)}
        @pointerleave=${this.onMouseLeave.bind(this)}
      >
        ${this.renderChildren()}
      </div>
    `}renderChildren(){return lit.qy`<slot></slot> `}onMouseEnter(){const rect=this.getBoundingClientRect();if(!this.open){const modalContainer=document.querySelector("w3m-modal"),triggerRect={width:rect.width,height:rect.height,left:rect.left,top:rect.top};if(modalContainer){const containerRect=modalContainer.getBoundingClientRect();triggerRect.left=rect.left-(window.innerWidth-containerRect.width)/2,triggerRect.top=rect.top-(window.innerHeight-containerRect.height)/2}TooltipController.showTooltip({message:this.text,triggerRect,variant:"shade"})}}onMouseLeave(event){this.contains(event.relatedTarget)||TooltipController.hide()}};WuiTooltipTrigger.styles=[w3m_tooltip_trigger_styles],w3m_tooltip_trigger_decorate([(0,decorators.MZ)()],WuiTooltipTrigger.prototype,"text",void 0),w3m_tooltip_trigger_decorate([(0,decorators.wk)()],WuiTooltipTrigger.prototype,"open",void 0),WuiTooltipTrigger=w3m_tooltip_trigger_decorate([(0,esm_exports.EM)("w3m-tooltip-trigger")],WuiTooltipTrigger);const w3m_tooltip_styles=esm_exports.AH`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px ${({spacing})=>spacing[3]} 10px ${({spacing})=>spacing[3]};
    border-radius: ${({borderRadius})=>borderRadius[3]};
    color: ${({tokens})=>tokens.theme.backgroundPrimary};
    position: absolute;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--apkt-modal-width) - ${({spacing})=>spacing[5]});
    transition: opacity ${({durations})=>durations.lg}
      ${({easings})=>easings["ease-out-power-2"]};
    will-change: opacity;
    opacity: 0;
    animation-duration: ${({durations})=>durations.xl};
    animation-timing-function: ${({easings})=>easings["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: ${({tokens})=>tokens.theme.foregroundPrimary};
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: ${({tokens})=>tokens.theme.textSecondary};
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: ${({tokens})=>tokens.theme.backgroundPrimary};
    border: 1px solid ${({tokens})=>tokens.theme.borderPrimary};
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: ${({tokens})=>tokens.theme.foregroundPrimary};
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;var w3m_tooltip_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mTooltip=class W3mTooltip extends lit.WF{constructor(){super(),this.unsubscribe=[],this.open=TooltipController.state.open,this.message=TooltipController.state.message,this.triggerRect=TooltipController.state.triggerRect,this.variant=TooltipController.state.variant,this.unsubscribe.push(TooltipController.subscribe(newState=>{this.open=newState.open,this.message=newState.message,this.triggerRect=newState.triggerRect,this.variant=newState.variant}))}disconnectedCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe())}render(){this.dataset.variant=this.variant;const topValue=this.triggerRect.top,leftValue=this.triggerRect.left;return this.style.cssText=`\n    --w3m-tooltip-top: ${topValue}px;\n    --w3m-tooltip-left: ${leftValue}px;\n    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;\n    --w3m-tooltip-display: ${this.open?"flex":"none"};\n    --w3m-tooltip-opacity: ${this.open?1:0};\n    `,lit.qy`<wui-flex>
      <wui-icon data-placement="top" size="inherit" name="cursor"></wui-icon>
      <wui-text color="primary" variant="sm-regular">${this.message}</wui-text>
    </wui-flex>`}};W3mTooltip.styles=[w3m_tooltip_styles],w3m_tooltip_decorate([(0,decorators.wk)()],W3mTooltip.prototype,"open",void 0),w3m_tooltip_decorate([(0,decorators.wk)()],W3mTooltip.prototype,"message",void 0),w3m_tooltip_decorate([(0,decorators.wk)()],W3mTooltip.prototype,"triggerRect",void 0),w3m_tooltip_decorate([(0,decorators.wk)()],W3mTooltip.prototype,"variant",void 0),W3mTooltip=w3m_tooltip_decorate([(0,esm_exports.EM)("w3m-tooltip")],W3mTooltip);const HelpersUtil_HelpersUtil={getTabsByNamespace:namespace=>Boolean(namespace)&&namespace===ConstantsUtil.o.CHAIN.EVM?!1===OptionsController.H.state.remoteFeatures?.activity?ConstantsUtil_ConstantsUtil.ACCOUNT_TABS.filter(tab=>"Activity"!==tab.label):ConstantsUtil_ConstantsUtil.ACCOUNT_TABS:[],isValidReownName:name=>/^[a-zA-Z0-9]+$/gu.test(name),isValidEmail:email=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/gu.test(email),validateReownName:name=>name.replace(/\^/gu,"").toLowerCase().replace(/[^a-zA-Z0-9]/gu,""),hasFooter(){const view=RouterController.I.state.view;if(ConstantsUtil_ConstantsUtil.VIEWS_WITH_LEGAL_FOOTER.includes(view)){const{termsConditionsUrl,privacyPolicyUrl}=OptionsController.H.state,legalCheckbox=OptionsController.H.state.features?.legalCheckbox;return!(!termsConditionsUrl&&!privacyPolicyUrl||legalCheckbox)}return ConstantsUtil_ConstantsUtil.VIEWS_WITH_DEFAULT_FOOTER.includes(view)}};__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/wui-ux-by-reown.js");const w3m_legal_footer_styles=esm_exports.AH`
  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: ${({spacing})=>spacing[3]};
  }

  a {
    text-decoration: none;
    color: ${({tokens})=>tokens.core.textAccentPrimary};
    font-weight: 500;
  }
`;var w3m_legal_footer_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mLegalFooter=class W3mLegalFooter extends lit.WF{constructor(){super(),this.unsubscribe=[],this.remoteFeatures=OptionsController.H.state.remoteFeatures,this.unsubscribe.push(OptionsController.H.subscribeKey("remoteFeatures",val=>this.remoteFeatures=val))}disconnectedCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe())}render(){const{termsConditionsUrl,privacyPolicyUrl}=OptionsController.H.state,legalCheckbox=OptionsController.H.state.features?.legalCheckbox;return!termsConditionsUrl&&!privacyPolicyUrl||legalCheckbox?lit.qy`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(!0)} </wui-flex>
      `:lit.qy`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${["4","3","3","3"]} justifyContent="center">
          <wui-text color="secondary" variant="md-regular" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}andTemplate(){const{termsConditionsUrl,privacyPolicyUrl}=OptionsController.H.state;return termsConditionsUrl&&privacyPolicyUrl?"and":""}termsTemplate(){const{termsConditionsUrl}=OptionsController.H.state;return termsConditionsUrl?lit.qy`<a href=${termsConditionsUrl} target="_blank" rel="noopener noreferrer"
      >Terms of Service</a
    >`:null}privacyTemplate(){const{privacyPolicyUrl}=OptionsController.H.state;return privacyPolicyUrl?lit.qy`<a href=${privacyPolicyUrl} target="_blank" rel="noopener noreferrer"
      >Privacy Policy</a
    >`:null}reownBrandingTemplate(showOnlyBranding=!1){return this.remoteFeatures?.reownBranding?showOnlyBranding?lit.qy`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`:lit.qy`<wui-ux-by-reown></wui-ux-by-reown>`:null}};W3mLegalFooter.styles=[w3m_legal_footer_styles],w3m_legal_footer_decorate([(0,decorators.wk)()],W3mLegalFooter.prototype,"remoteFeatures",void 0),W3mLegalFooter=w3m_legal_footer_decorate([(0,esm_exports.EM)("w3m-legal-footer")],W3mLegalFooter);__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/wui-link.js");const w3m_onramp_providers_footer_styles=lit.AH``;var w3m_onramp_providers_footer_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mOnRampProvidersFooter=class W3mOnRampProvidersFooter extends lit.WF{render(){const{termsConditionsUrl,privacyPolicyUrl}=OptionsController.H.state;return termsConditionsUrl||privacyPolicyUrl?lit.qy`
      <wui-flex
        .padding=${["4","3","3","3"]}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `:null}howDoesItWorkTemplate(){return lit.qy` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){EventsController.E.sendEvent({type:"track",event:"SELECT_WHAT_IS_A_BUY",properties:{isSmartAccount:(0,ChainControllerUtil.lj)(ChainController.W.state.activeChain)===W3mFrameConstants.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}}),RouterController.I.push("WhatIsABuy")}};W3mOnRampProvidersFooter.styles=[w3m_onramp_providers_footer_styles],W3mOnRampProvidersFooter=w3m_onramp_providers_footer_decorate([(0,esm_exports.EM)("w3m-onramp-providers-footer")],W3mOnRampProvidersFooter);const w3m_footer_styles=esm_exports.AH`
  :host {
    display: block;
  }

  div.container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    height: auto;
    display: block;
  }

  div.container[status='hide'] {
    animation: fade-out;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings})=>easings["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: 0s;
  }

  div.container[status='show'] {
    animation: fade-in;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings})=>easings["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(6px);
    }
    to {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
      filter: blur(0px);
    }
    to {
      opacity: 0;
      filter: blur(6px);
    }
  }
`;var w3m_footer_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mFooter=class W3mFooter extends lit.WF{constructor(){super(...arguments),this.resizeObserver=void 0,this.unsubscribe=[],this.status="hide",this.view=RouterController.I.state.view}firstUpdated(){this.status=HelpersUtil_HelpersUtil.hasFooter()?"show":"hide",this.unsubscribe.push(RouterController.I.subscribeKey("view",val=>{if(this.view=val,this.status=HelpersUtil_HelpersUtil.hasFooter()?"show":"hide","hide"===this.status){document.documentElement.style.setProperty("--apkt-footer-height","0px")}})),this.resizeObserver=new ResizeObserver(entries=>{for(const entry of entries)if(entry.target===this.getWrapper()){const newHeight=`${entry.contentRect.height}px`;document.documentElement.style.setProperty("--apkt-footer-height",newHeight)}}),this.resizeObserver.observe(this.getWrapper())}render(){return lit.qy`
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `}templatePageContainer(){return HelpersUtil_HelpersUtil.hasFooter()?lit.qy` ${this.templateFooter()}`:null}templateFooter(){switch(this.view){case"Networks":return this.templateNetworksFooter();case"Connect":case"ConnectWallets":case"OnRampFiatSelect":case"OnRampTokenSelect":return lit.qy`<w3m-legal-footer></w3m-legal-footer>`;case"OnRampProviders":return lit.qy`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`;default:return null}}templateNetworksFooter(){return lit.qy` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`}onNetworkHelp(){EventsController.E.sendEvent({type:"track",event:"CLICK_NETWORK_HELP"}),RouterController.I.push("WhatIsANetwork")}getWrapper(){return this.shadowRoot?.querySelector("div.container")}};W3mFooter.styles=[w3m_footer_styles],w3m_footer_decorate([(0,decorators.wk)()],W3mFooter.prototype,"status",void 0),w3m_footer_decorate([(0,decorators.wk)()],W3mFooter.prototype,"view",void 0),W3mFooter=w3m_footer_decorate([(0,esm_exports.EM)("w3m-footer")],W3mFooter);const w3m_router_styles=esm_exports.AH`
  :host {
    display: block;
    width: inherit;
  }
`;var w3m_router_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mRouter=class W3mRouter extends lit.WF{constructor(){super(),this.unsubscribe=[],this.viewState=RouterController.I.state.view,this.history=RouterController.I.state.history.join(","),this.unsubscribe.push(RouterController.I.subscribeKey("view",()=>{this.history=RouterController.I.state.history.join(","),document.documentElement.style.setProperty("--apkt-duration-dynamic","var(--apkt-durations-lg)")}))}disconnectedCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe()),document.documentElement.style.setProperty("--apkt-duration-dynamic","0s")}render(){return lit.qy`${this.templatePageContainer()}`}templatePageContainer(){return lit.qy`<w3m-router-container
      history=${this.history}
      .setView=${()=>{this.viewState=RouterController.I.state.view}}
    >
      ${this.viewTemplate(this.viewState)}
    </w3m-router-container>`}viewTemplate(view){switch(view){case"AccountSettings":return lit.qy`<w3m-account-settings-view></w3m-account-settings-view>`;case"Account":return lit.qy`<w3m-account-view></w3m-account-view>`;case"AllWallets":return lit.qy`<w3m-all-wallets-view></w3m-all-wallets-view>`;case"ApproveTransaction":return lit.qy`<w3m-approve-transaction-view></w3m-approve-transaction-view>`;case"BuyInProgress":return lit.qy`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`;case"ChooseAccountName":return lit.qy`<w3m-choose-account-name-view></w3m-choose-account-name-view>`;case"Connect":default:return lit.qy`<w3m-connect-view></w3m-connect-view>`;case"Create":return lit.qy`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`;case"ConnectingWalletConnect":return lit.qy`<w3m-connecting-wc-view></w3m-connecting-wc-view>`;case"ConnectingWalletConnectBasic":return lit.qy`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`;case"ConnectingExternal":return lit.qy`<w3m-connecting-external-view></w3m-connecting-external-view>`;case"ConnectingSiwe":return lit.qy`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`;case"ConnectWallets":return lit.qy`<w3m-connect-wallets-view></w3m-connect-wallets-view>`;case"ConnectSocials":return lit.qy`<w3m-connect-socials-view></w3m-connect-socials-view>`;case"ConnectingSocial":return lit.qy`<w3m-connecting-social-view></w3m-connecting-social-view>`;case"DataCapture":return lit.qy`<w3m-data-capture-view></w3m-data-capture-view>`;case"DataCaptureOtpConfirm":return lit.qy`<w3m-data-capture-otp-confirm-view></w3m-data-capture-otp-confirm-view>`;case"Downloads":return lit.qy`<w3m-downloads-view></w3m-downloads-view>`;case"EmailLogin":return lit.qy`<w3m-email-login-view></w3m-email-login-view>`;case"EmailVerifyOtp":return lit.qy`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`;case"EmailVerifyDevice":return lit.qy`<w3m-email-verify-device-view></w3m-email-verify-device-view>`;case"GetWallet":return lit.qy`<w3m-get-wallet-view></w3m-get-wallet-view>`;case"Networks":return lit.qy`<w3m-networks-view></w3m-networks-view>`;case"SwitchNetwork":return lit.qy`<w3m-network-switch-view></w3m-network-switch-view>`;case"ProfileWallets":return lit.qy`<w3m-profile-wallets-view></w3m-profile-wallets-view>`;case"Transactions":return lit.qy`<w3m-transactions-view></w3m-transactions-view>`;case"OnRampProviders":return lit.qy`<w3m-onramp-providers-view></w3m-onramp-providers-view>`;case"OnRampTokenSelect":return lit.qy`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`;case"OnRampFiatSelect":return lit.qy`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`;case"UpgradeEmailWallet":return lit.qy`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`;case"UpdateEmailWallet":return lit.qy`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`;case"UpdateEmailPrimaryOtp":return lit.qy`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`;case"UpdateEmailSecondaryOtp":return lit.qy`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`;case"UnsupportedChain":return lit.qy`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`;case"Swap":return lit.qy`<w3m-swap-view></w3m-swap-view>`;case"SwapSelectToken":return lit.qy`<w3m-swap-select-token-view></w3m-swap-select-token-view>`;case"SwapPreview":return lit.qy`<w3m-swap-preview-view></w3m-swap-preview-view>`;case"WalletSend":return lit.qy`<w3m-wallet-send-view></w3m-wallet-send-view>`;case"WalletSendSelectToken":return lit.qy`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`;case"WalletSendPreview":return lit.qy`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`;case"WalletSendConfirmed":return lit.qy`<w3m-send-confirmed-view></w3m-send-confirmed-view>`;case"WhatIsABuy":return lit.qy`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`;case"WalletReceive":return lit.qy`<w3m-wallet-receive-view></w3m-wallet-receive-view>`;case"WalletCompatibleNetworks":return lit.qy`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`;case"WhatIsAWallet":return lit.qy`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`;case"ConnectingMultiChain":return lit.qy`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`;case"WhatIsANetwork":return lit.qy`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`;case"ConnectingFarcaster":return lit.qy`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`;case"SwitchActiveChain":return lit.qy`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`;case"RegisterAccountName":return lit.qy`<w3m-register-account-name-view></w3m-register-account-name-view>`;case"RegisterAccountNameSuccess":return lit.qy`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`;case"SmartSessionCreated":return lit.qy`<w3m-smart-session-created-view></w3m-smart-session-created-view>`;case"SmartSessionList":return lit.qy`<w3m-smart-session-list-view></w3m-smart-session-list-view>`;case"SIWXSignMessage":return lit.qy`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`;case"Pay":return lit.qy`<w3m-pay-view></w3m-pay-view>`;case"PayLoading":return lit.qy`<w3m-pay-loading-view></w3m-pay-loading-view>`;case"PayQuote":return lit.qy`<w3m-pay-quote-view></w3m-pay-quote-view>`;case"FundWallet":return lit.qy`<w3m-fund-wallet-view></w3m-fund-wallet-view>`;case"PayWithExchange":return lit.qy`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`;case"PayWithExchangeSelectAsset":return lit.qy`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`;case"UsageExceeded":return lit.qy`<w3m-usage-exceeded-view></w3m-usage-exceeded-view>`;case"SmartAccountSettings":return lit.qy`<w3m-smart-account-settings-view></w3m-smart-account-settings-view>`}}};W3mRouter.styles=[w3m_router_styles],w3m_router_decorate([(0,decorators.wk)()],W3mRouter.prototype,"viewState",void 0),w3m_router_decorate([(0,decorators.wk)()],W3mRouter.prototype,"history",void 0),W3mRouter=w3m_router_decorate([(0,esm_exports.EM)("w3m-router")],W3mRouter);const w3m_modal_styles=esm_exports.AH`
  :host {
    z-index: ${({tokens})=>tokens.core.zIndex};
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: ${({tokens})=>tokens.theme.overlay};
    backdrop-filter: blur(0px);
    transition:
      opacity ${({durations})=>durations.lg} ${({easings})=>easings["ease-out-power-2"]},
      backdrop-filter ${({durations})=>durations.lg}
        ${({easings})=>easings["ease-out-power-2"]};
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--apkt-modal-width);
    width: 100%;
    position: relative;
    outline: none;
    transform: translateY(4px);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    transition:
      transform ${({durations})=>durations.lg}
        ${({easings})=>easings["ease-out-power-2"]},
      border-radius ${({durations})=>durations.lg}
        ${({easings})=>easings["ease-out-power-1"]},
      background-color ${({durations})=>durations.lg}
        ${({easings})=>easings["ease-out-power-1"]},
      box-shadow ${({durations})=>durations.lg}
        ${({easings})=>easings["ease-out-power-1"]};
    will-change: border-radius, background-color, transform, box-shadow;
    background-color: ${({tokens})=>tokens.theme.backgroundPrimary};
    padding: var(--local-modal-padding);
    box-sizing: border-box;
  }

  :host(.open) wui-card {
    transform: translateY(0px);
  }

  wui-card::before {
    z-index: 1;
    pointer-events: none;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    transition: box-shadow ${({durations})=>durations.lg}
      ${({easings})=>easings["ease-out-power-2"]};
    transition-delay: ${({durations})=>durations.md};
    will-change: box-shadow;
  }

  :host([data-mobile-fullscreen='true']) wui-card::before {
    border-radius: 0px;
  }

  :host([data-border='true']) wui-card::before {
    box-shadow: inset 0px 0px 0px 4px ${({tokens})=>tokens.theme.foregroundSecondary};
  }

  :host([data-border='false']) wui-card::before {
    box-shadow: inset 0px 0px 0px 1px ${({tokens})=>tokens.theme.borderPrimaryDark};
  }

  :host([data-border='true']) wui-card {
    animation:
      fade-in ${({durations})=>durations.lg} ${({easings})=>easings["ease-out-power-2"]},
      card-background-border var(--apkt-duration-dynamic)
        ${({easings})=>easings["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  :host([data-border='false']) wui-card {
    animation:
      fade-in ${({durations})=>durations.lg} ${({easings})=>easings["ease-out-power-2"]},
      card-background-default var(--apkt-duration-dynamic)
        ${({easings})=>easings["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: 0s;
  }

  :host(.appkit-modal) wui-card {
    max-width: var(--apkt-modal-width);
  }

  wui-card[shake='true'] {
    animation:
      fade-in ${({durations})=>durations.lg} ${({easings})=>easings["ease-out-power-2"]},
      w3m-shake ${({durations})=>durations.xl}
        ${({easings})=>easings["ease-out-power-2"]};
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--apkt-spacing-6) 0px;
    }
  }

  @media (max-width: 430px) {
    :host([data-mobile-fullscreen='true']) {
      height: 100dvh;
    }
    :host([data-mobile-fullscreen='true']) wui-flex {
      align-items: stretch;
    }
    :host([data-mobile-fullscreen='true']) wui-card {
      max-width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
    }
    :host(:not([data-mobile-fullscreen='true'])) wui-flex {
      align-items: flex-end;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card {
      max-width: 100%;
      border-bottom: none;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card[data-embedded='true'] {
      border-bottom-left-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
      border-bottom-right-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card:not([data-embedded='true']) {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    wui-card[shake='true'] {
      animation: w3m-shake 0.5s ${({easings})=>easings["ease-out-power-2"]};
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0.99) translateY(4px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes card-background-border {
    from {
      background-color: ${({tokens})=>tokens.theme.backgroundPrimary};
    }
    to {
      background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
    }
  }

  @keyframes card-background-default {
    from {
      background-color: ${({tokens})=>tokens.theme.foregroundSecondary};
    }
    to {
      background-color: ${({tokens})=>tokens.theme.backgroundPrimary};
    }
  }
`;var w3m_modal_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};const PADDING_OVERRIDES={PayWithExchange:"0",PayWithExchangeSelectAsset:"0",Pay:"0",PayQuote:"0",PayLoading:"0"};class W3mModalBase extends lit.WF{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=OptionsController.H.state.enableEmbedded,this.open=ModalController.W.state.open,this.caipAddress=ChainController.W.state.activeCaipAddress,this.caipNetwork=ChainController.W.state.activeCaipNetwork,this.shake=ModalController.W.state.shake,this.filterByNamespace=ConnectorController.a.state.filterByNamespace,this.padding=esm_exports.f.spacing[1],this.mobileFullScreen=OptionsController.H.state.enableMobileFullScreen,this.initializeTheming(),ApiController.N.prefetchAnalyticsConfig(),this.unsubscribe.push(ModalController.W.subscribeKey("open",val=>val?this.onOpen():this.onClose()),ModalController.W.subscribeKey("shake",val=>this.shake=val),ChainController.W.subscribeKey("activeCaipNetwork",val=>this.onNewNetwork(val)),ChainController.W.subscribeKey("activeCaipAddress",val=>this.onNewAddress(val)),OptionsController.H.subscribeKey("enableEmbedded",val=>this.enableEmbedded=val),ConnectorController.a.subscribeKey("filterByNamespace",val=>{this.filterByNamespace===val||ChainController.W.getAccountData(val)?.caipAddress||(ApiController.N.fetchRecommendedWallets(),this.filterByNamespace=val)}),RouterController.I.subscribeKey("view",()=>{this.dataset.border=HelpersUtil_HelpersUtil.hasFooter()?"true":"false",this.padding=PADDING_OVERRIDES[RouterController.I.state.view]??esm_exports.f.spacing[1]}))}firstUpdated(){if(this.dataset.border=HelpersUtil_HelpersUtil.hasFooter()?"true":"false",this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),this.caipAddress){if(this.enableEmbedded)return ModalController.W.close(),void this.prefetch();this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(unsubscribe=>unsubscribe()),this.onRemoveKeyboardListener()}render(){return this.style.setProperty("--local-modal-padding",this.padding),this.enableEmbedded?lit.qy`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?lit.qy`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return lit.qy` <wui-card
      shake="${this.shake}"
      data-embedded="${(0,if_defined.J)(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-footer></w3m-footer>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(event){if(event.target===event.currentTarget){if(this.mobileFullScreen)return;await this.handleClose()}}async handleClose(){await ModalUtil.safeClose()}initializeTheming(){const{themeVariables,themeMode}=ThemeController.W.state,defaultThemeMode=esm_exports.Zv.getColorTheme(themeMode);(0,esm_exports.RF)(themeVariables,defaultThemeMode)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),SnackController.P.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){const styleTag=document.createElement("style");styleTag.dataset.w3m="scroll-lock",styleTag.textContent="\n      body {\n        touch-action: none;\n        overflow: hidden;\n        overscroll-behavior: contain;\n      }\n      w3m-modal {\n        pointer-events: auto;\n      }\n    ",document.head.appendChild(styleTag)}onScrollUnlock(){const styleTag=document.head.querySelector('style[data-w3m="scroll-lock"]');styleTag&&styleTag.remove()}onAddKeyboardListener(){this.abortController=new AbortController;const card=this.shadowRoot?.querySelector("wui-card");card?.focus(),window.addEventListener("keydown",event=>{if("Escape"===event.key)this.handleClose();else if("Tab"===event.key){const{tagName}=event.target;!tagName||tagName.includes("W3M-")||tagName.includes("WUI-")||card?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}async onNewAddress(caipAddress){const isSwitchingNamespace=ChainController.W.state.isSwitchingNamespace,isInProfileView="ProfileWallets"===RouterController.I.state.view;!caipAddress&&!isSwitchingNamespace&&!isInProfileView&&ModalController.W.close(),await SIWXUtil.U.initializeIfEnabled(caipAddress),this.caipAddress=caipAddress,ChainController.W.setIsSwitchingNamespace(!1)}onNewNetwork(nextCaipNetwork){const prevCaipNetwork=this.caipNetwork,prevCaipNetworkId=prevCaipNetwork?.caipNetworkId?.toString(),nextNetworkId=nextCaipNetwork?.caipNetworkId?.toString(),didNetworkChange=prevCaipNetworkId!==nextNetworkId,isUnsupportedNetworkScreen="UnsupportedChain"===RouterController.I.state.view,isModalOpen=ModalController.W.state.open;let shouldGoBack=!1;this.enableEmbedded&&"SwitchNetwork"===RouterController.I.state.view&&(shouldGoBack=!0),didNetworkChange&&SwapController.resetState(),isModalOpen&&isUnsupportedNetworkScreen&&(shouldGoBack=!0),shouldGoBack&&"SIWXSignMessage"!==RouterController.I.state.view&&RouterController.I.goBack(),this.caipNetwork=nextCaipNetwork}prefetch(){this.hasPrefetched||(ApiController.N.prefetch(),ApiController.N.fetchWalletsByPage({page:1}),this.hasPrefetched=!0)}}W3mModalBase.styles=w3m_modal_styles,w3m_modal_decorate([(0,decorators.MZ)({type:Boolean})],W3mModalBase.prototype,"enableEmbedded",void 0),w3m_modal_decorate([(0,decorators.wk)()],W3mModalBase.prototype,"open",void 0),w3m_modal_decorate([(0,decorators.wk)()],W3mModalBase.prototype,"caipAddress",void 0),w3m_modal_decorate([(0,decorators.wk)()],W3mModalBase.prototype,"caipNetwork",void 0),w3m_modal_decorate([(0,decorators.wk)()],W3mModalBase.prototype,"shake",void 0),w3m_modal_decorate([(0,decorators.wk)()],W3mModalBase.prototype,"filterByNamespace",void 0),w3m_modal_decorate([(0,decorators.wk)()],W3mModalBase.prototype,"padding",void 0),w3m_modal_decorate([(0,decorators.wk)()],W3mModalBase.prototype,"mobileFullScreen",void 0);let W3mModal=class W3mModal extends W3mModalBase{};W3mModal=w3m_modal_decorate([(0,esm_exports.EM)("w3m-modal")],W3mModal);let AppKitModal=class AppKitModal extends W3mModalBase{};AppKitModal=w3m_modal_decorate([(0,esm_exports.EM)("appkit-modal")],AppKitModal);const w3m_usage_exceeded_view_styles=esm_exports.AH`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: ${({borderRadius})=>borderRadius[5]};
    background-color: ${({colors})=>colors.semanticError010};
  }
`;var w3m_usage_exceeded_view_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mUsageExceededView=class W3mUsageExceededView extends lit.WF{constructor(){super()}render(){return lit.qy`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${["1","3","4","3"]}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="error" name="warningCircle"></wui-icon>
        </wui-flex>

        <wui-text variant="lg-medium" color="primary" align="center">
          The app isn't responding as expected
        </wui-text>
        <wui-text variant="md-regular" color="secondary" align="center">
          Try again or reach out to the app team for help.
        </wui-text>

        <wui-button
          variant="neutral-secondary"
          size="md"
          @click=${this.onTryAgainClick.bind(this)}
          data-testid="w3m-usage-exceeded-button"
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try Again
        </wui-button>
      </wui-flex>
    `}onTryAgainClick(){RouterController.I.goBack()}};W3mUsageExceededView.styles=w3m_usage_exceeded_view_styles,W3mUsageExceededView=w3m_usage_exceeded_view_decorate([(0,esm_exports.EM)("w3m-usage-exceeded-view")],W3mUsageExceededView);var AdapterController=__webpack_require__("./node_modules/@reown/appkit-controllers/dist/esm/src/controllers/AdapterController/index.js");__webpack_require__("./node_modules/@reown/appkit-ui/dist/esm/exports/wui-list-wallet.js");const w3m_list_wallet_styles=esm_exports.AH`
  :host {
    width: 100%;
  }
`;var w3m_list_wallet_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mListWallet=class W3mListWallet extends lit.WF{constructor(){super(...arguments),this.hasImpressionSent=!1,this.walletImages=[],this.imageSrc="",this.name="",this.size="md",this.tabIdx=void 0,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor="accent-100",this.rdnsId="",this.displayIndex=void 0,this.walletRank=void 0,this.namespaces=[]}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupIntersectionObserver()}updated(changedProperties){super.updated(changedProperties),(changedProperties.has("name")||changedProperties.has("imageSrc")||changedProperties.has("walletRank"))&&(this.hasImpressionSent=!1);changedProperties.has("walletRank")&&this.walletRank&&!this.intersectionObserver&&this.setupIntersectionObserver()}setupIntersectionObserver(){this.intersectionObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{!entry.isIntersecting||this.loading||this.hasImpressionSent||this.sendImpressionEvent()})},{threshold:.1}),this.intersectionObserver.observe(this)}cleanupIntersectionObserver(){this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=void 0)}sendImpressionEvent(){this.name&&!this.hasImpressionSent&&this.walletRank&&(this.hasImpressionSent=!0,(this.rdnsId||this.name)&&EventsController.E.sendWalletImpressionEvent({name:this.name,walletRank:this.walletRank,rdnsId:this.rdnsId,view:RouterController.I.state.view,displayIndex:this.displayIndex}))}handleGetWalletNamespaces(){return Object.keys(AdapterController.q.state.adapters).length>1?this.namespaces:[]}render(){return lit.qy`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${(0,if_defined.J)(this.imageSrc)}
        name=${this.name}
        size=${(0,if_defined.J)(this.size)}
        tagLabel=${(0,if_defined.J)(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
        .namespaces=${this.handleGetWalletNamespaces()}
      ></wui-list-wallet>
    `}};W3mListWallet.styles=w3m_list_wallet_styles,w3m_list_wallet_decorate([(0,decorators.MZ)({type:Array})],W3mListWallet.prototype,"walletImages",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)()],W3mListWallet.prototype,"imageSrc",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)()],W3mListWallet.prototype,"name",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)()],W3mListWallet.prototype,"size",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)()],W3mListWallet.prototype,"tagLabel",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)()],W3mListWallet.prototype,"tagVariant",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)()],W3mListWallet.prototype,"walletIcon",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)()],W3mListWallet.prototype,"tabIdx",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)({type:Boolean})],W3mListWallet.prototype,"disabled",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)({type:Boolean})],W3mListWallet.prototype,"showAllWallets",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)({type:Boolean})],W3mListWallet.prototype,"loading",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)({type:String})],W3mListWallet.prototype,"loadingSpinnerColor",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)()],W3mListWallet.prototype,"rdnsId",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)()],W3mListWallet.prototype,"displayIndex",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)()],W3mListWallet.prototype,"walletRank",void 0),w3m_list_wallet_decorate([(0,decorators.MZ)({type:Array})],W3mListWallet.prototype,"namespaces",void 0),W3mListWallet=w3m_list_wallet_decorate([(0,esm_exports.EM)("w3m-list-wallet")],W3mListWallet);const w3m_router_container_styles=esm_exports.AH`
  :host {
    --local-duration-height: 0s;
    --local-duration: ${({durations})=>durations.lg};
    --local-transition: ${({easings})=>easings["ease-out-power-2"]};
  }

  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--local-container-height);
    transition: height var(--local-duration-height) var(--local-transition);
    will-change: height, padding-bottom;
  }

  .container[data-mobile-fullscreen='true'] {
    overflow: scroll;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    width: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: ${({tokens})=>tokens.theme.backgroundPrimary};
    border-bottom-left-radius: var(--local-border-bottom-radius);
    border-bottom-right-radius: var(--local-border-bottom-radius);
    transition: border-bottom-left-radius var(--local-duration) var(--local-transition);
  }

  .page[data-mobile-fullscreen='true'] {
    height: 100%;
  }

  .page-content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .footer {
    height: var(--apkt-footer-height);
  }

  div.page[view-direction^='prev-'] .page-content {
    animation:
      slide-left-out var(--local-duration) forwards var(--local-transition),
      slide-left-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations})=>durations.lg});
  }

  div.page[view-direction^='next-'] .page-content {
    animation:
      slide-right-out var(--local-duration) forwards var(--local-transition),
      slide-right-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations})=>durations.lg});
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`;var w3m_router_container_decorate=function(decorators,target,key,desc){var d,c=arguments.length,r=c<3?target:null===desc?desc=Object.getOwnPropertyDescriptor(target,key):desc;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)(d=decorators[i])&&(r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r);return c>3&&r&&Object.defineProperty(target,key,r),r};let W3mRouterContainer=class W3mRouterContainer extends lit.WF{constructor(){super(...arguments),this.resizeObserver=void 0,this.transitionDuration="0.15s",this.transitionFunction="",this.history="",this.view="",this.setView=void 0,this.viewDirection="",this.historyState="",this.previousHeight="0px",this.mobileFullScreen=OptionsController.H.state.enableMobileFullScreen,this.onViewportResize=()=>{this.updateContainerHeight()}}updated(changedProps){if(changedProps.has("history")){const newHistory=this.history;""!==this.historyState&&this.historyState!==newHistory&&this.onViewChange(newHistory)}changedProps.has("transitionDuration")&&this.style.setProperty("--local-duration",this.transitionDuration),changedProps.has("transitionFunction")&&this.style.setProperty("--local-transition",this.transitionFunction)}firstUpdated(){this.transitionFunction&&this.style.setProperty("--local-transition",this.transitionFunction),this.style.setProperty("--local-duration",this.transitionDuration),this.historyState=this.history,this.resizeObserver=new ResizeObserver(entries=>{for(const entry of entries)if(entry.target===this.getWrapper()){let newHeight=entry.contentRect.height;const footerHeight=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0");if(this.mobileFullScreen){newHeight=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-footerHeight,this.style.setProperty("--local-border-bottom-radius","0px")}else{newHeight=newHeight+footerHeight,this.style.setProperty("--local-border-bottom-radius",footerHeight?"var(--apkt-borderRadius-5)":"0px")}this.style.setProperty("--local-container-height",`${newHeight}px`),"0px"!==this.previousHeight&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${newHeight}px`}}),this.resizeObserver.observe(this.getWrapper()),this.updateContainerHeight(),window.addEventListener("resize",this.onViewportResize),window.visualViewport?.addEventListener("resize",this.onViewportResize)}disconnectedCallback(){const wrapper=this.getWrapper();wrapper&&this.resizeObserver&&this.resizeObserver.unobserve(wrapper),window.removeEventListener("resize",this.onViewportResize),window.visualViewport?.removeEventListener("resize",this.onViewportResize)}render(){return lit.qy`
      <div class="container" data-mobile-fullscreen="${(0,if_defined.J)(this.mobileFullScreen)}">
        <div
          class="page"
          data-mobile-fullscreen="${(0,if_defined.J)(this.mobileFullScreen)}"
          view-direction="${this.viewDirection}"
        >
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `}onViewChange(history){const historyArr=history.split(",").filter(Boolean),prevArr=this.historyState.split(",").filter(Boolean),prevLength=prevArr.length,newLength=historyArr.length,newView=historyArr[historyArr.length-1]||"",duration=esm_exports.Zv.cssDurationToNumber(this.transitionDuration);let direction="";newLength>prevLength?direction="next":newLength<prevLength?direction="prev":newLength===prevLength&&historyArr[newLength-1]!==prevArr[prevLength-1]&&(direction="next"),this.viewDirection=`${direction}-${newView}`,setTimeout(()=>{this.historyState=history,this.setView?.(newView)},duration),setTimeout(()=>{this.viewDirection=""},2*duration)}getWrapper(){return this.shadowRoot?.querySelector("div.page")}updateContainerHeight(){const wrapper=this.getWrapper();if(!wrapper)return;const footerHeight=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0");let newHeight=0;if(this.mobileFullScreen){newHeight=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-footerHeight,this.style.setProperty("--local-border-bottom-radius","0px")}else newHeight=wrapper.getBoundingClientRect().height+footerHeight,this.style.setProperty("--local-border-bottom-radius",footerHeight?"var(--apkt-borderRadius-5)":"0px");this.style.setProperty("--local-container-height",`${newHeight}px`),"0px"!==this.previousHeight&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${newHeight}px`}getHeaderHeight(){return 60}};W3mRouterContainer.styles=[w3m_router_container_styles],w3m_router_container_decorate([(0,decorators.MZ)({type:String})],W3mRouterContainer.prototype,"transitionDuration",void 0),w3m_router_container_decorate([(0,decorators.MZ)({type:String})],W3mRouterContainer.prototype,"transitionFunction",void 0),w3m_router_container_decorate([(0,decorators.MZ)({type:String})],W3mRouterContainer.prototype,"history",void 0),w3m_router_container_decorate([(0,decorators.MZ)({type:String})],W3mRouterContainer.prototype,"view",void 0),w3m_router_container_decorate([(0,decorators.MZ)({attribute:!1})],W3mRouterContainer.prototype,"setView",void 0),w3m_router_container_decorate([(0,decorators.wk)()],W3mRouterContainer.prototype,"viewDirection",void 0),w3m_router_container_decorate([(0,decorators.wk)()],W3mRouterContainer.prototype,"historyState",void 0),w3m_router_container_decorate([(0,decorators.wk)()],W3mRouterContainer.prototype,"previousHeight",void 0),w3m_router_container_decorate([(0,decorators.wk)()],W3mRouterContainer.prototype,"mobileFullScreen",void 0),W3mRouterContainer=w3m_router_container_decorate([(0,esm_exports.EM)("w3m-router-container")],W3mRouterContainer)}}]);
//# sourceMappingURL=8598.712cbe2f.iframe.bundle.js.map