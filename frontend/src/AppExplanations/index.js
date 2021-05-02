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

  const howMuchCanIGet_help =
    // eslint-disable-next-line
    "`Plenty enough!`  \n\
    Transactions on Polygon network are dirt cheap. Forget Ethereum, forget BSC, we're talking about fractions of a cent for most transactions.  \n\
    So this faucet will only send you `0.0005 MATIC` - which is enough to deposit some fund on Aave and [earn fresh MATIC](https://medium.com/stakingbits/guide-to-yield-farming-with-aave-on-polygon-matic-network-a03bd2154275), for instance  \n\
    The goal of this faucet is not to make you rich but just to make the onboarding to Polygon smoother.  \n\
    Feel free to send some spare change at `0xCC2161DB3200EEF7E37E21542dA2F0179fB9c59A` to replenish the faucet once youre rich 🦄";

  const whatToDoOnPolygon_help =
    "* First bring your assets from Ethereum to Polygon through [the bridge](https://wallet.matic.network/bridge/)  \n\
    Then there's a variety of things you can do:  \n\
    * Swapping assets on [QuickSwap](https://quickswap.exchange/) or [ComethSwap](https://swap.cometh.io/#/swap), the equivalents of `Uniswap` on Polygon  \n\
    [Paraswap](https://paraswap.io/#/?network=polygon) is also available and will route your swaps through the cheapest path.  \n\
    * Depositing your assets on [Aave](https://app.aave.com/dashboard) or [Curve](https://polygon.curve.fi/) to farm some fresh MATIC  \n\
    * Enjoying the same functionalities Ethereum has, only with less friction 🦄  \n\
    ";

  return (
    <Accordion allowZeroExpanded allowMultipleExpanded onChange={handleExpand}>
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
            What to do on Polygon ?
          </AccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel>
          <ReactMarkdown
            className="Explanations"
            children={whatToDoOnPolygon_help}
          ></ReactMarkdown>
        </AccordionItemPanel>
      </AccordionItem>
    </Accordion>
  );
}
