import React, { useState } from "react";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import ReactMarkdown from "react-markdown";
import "./index.css";

export default function AppExplanations() {
  const [expandedItems, setexpandedItems] = useState([]);

  // In case the user expands a node that is barely visible, we scroll the page to display it fully
  function handleExpand(update) {
    if (update.length > expandedItems.length) {
      const newExpandedItemUUID = update[update.length - 1];
      const itemButtonBottom = document
        .getElementById(`accordion__panel-${newExpandedItemUUID}`)
        .getBoundingClientRect().bottom;
      if (itemButtonBottom > window.innerHeight) {
        window.scrollBy(0, itemButtonBottom - window.innerHeight);
      }
    }
    setexpandedItems(update);
  }

  const whatIsAFaucet_help =
    // eslint-disable-next-line
    "A `Faucet` is a tool that provides a small amount of funds to start using a cryptocurrency without having to buy some. \n\
    It's often a shity website with plenty of adds that will send you funds half the time, only after asking you to input your email to send you spam later.  \n\
    `Polygon` had none for its mainnet, so here's one, without the crap you usually get on typical faucets";


  const howMuchCanIGet_help =
    // eslint-disable-next-line
    "`Plenty enough!`  \n\
    Transactions on Polygon network are dirt cheap. Forget Ethereum, forget BSC, we're talking about fractions of a cent for most transactions.  \n\
    So this faucet will only send you `0.001 MATIC` - which is enough to deposit some fund on Aave and [earn fresh MATIC](https://medium.com/stakingbits/guide-to-yield-farming-with-aave-on-polygon-matic-network-a03bd2154275), for instance  \n\
    With `0.001 MATIC`, you can do `100` basic transactions on Polygon network ! You can even deposit or withdraw funds on `Aave`, even though it is a pretty expensive transaction (`50$+` on Ethereum, `1$+` on Binance Smart Chain). \n\
    The goal of this faucet is not to make you rich but just to make the onboarding to Polygon smoother.  \n\
    You can use it up to `3 times a day`, for the most clumsy of us 🙄  \n\
    Feel free to send some spare change at `0x8C5a6C767Ee7084a8C656Acd457Da9561163aE7E` to replenish the faucet once you're rich 🦄";

  const howToEarnMoreMatic_help =
    "* First bring your assets from Ethereum to Polygon through [the bridge](https://wallet.matic.network/bridge/)  \n\
    Then there's a variety of things you can do:  \n\
    * Swapping assets on [QuickSwap](https://quickswap.exchange/) or [ComethSwap](https://swap.cometh.io/#/swap), the equivalents of `Uniswap` on Polygon  \n\
    [Paraswap](https://paraswap.io/#/?network=polygon) is also available and will route your swaps through the cheapest path.  \n\
    * Depositing your assets on [Aave](https://app.aave.com/dashboard) or [Curve](https://polygon.curve.fi/) to farm some fresh MATIC  \n\
    * Enjoy the same functionalities Ethereum has, only with less friction 🦄  \n\
    ";

  return (
    <Accordion allowZeroExpanded allowMultipleExpanded onChange={handleExpand}>
       <AccordionItem>
        <AccordionItemHeading>
          <AccordionItemButton>What is a Faucet ?</AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <ReactMarkdown
            className="Explanations"
            children={whatIsAFaucet_help}
          ></ReactMarkdown>
        </AccordionItemPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeading>
          <AccordionItemButton>How much can I get ?</AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <ReactMarkdown
            className="Explanations"
            children={howMuchCanIGet_help}
          ></ReactMarkdown>
        </AccordionItemPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeading>
          <AccordionItemButton>
            How to earn (much) more MATIC ?
          </AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <ReactMarkdown
            className="Explanations"
            children={howToEarnMoreMatic_help}
          ></ReactMarkdown>
        </AccordionItemPanel>
      </AccordionItem>
    </Accordion>
  );
}
