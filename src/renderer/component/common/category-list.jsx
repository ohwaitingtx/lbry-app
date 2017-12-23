import React from "react";
import ToolTip from "component/tooltip.js";
import FileCard from "component/fileCard";
import { Icon } from "component/common.js";
import Button from "component/button";

class CategoryList extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      numItems: undefined,
      canScrollPrevious: false,
      canScrollNext: false,
    };
  }

  componentWillMount() {
    this.setState({
      numItems: this.props.names.length,
    });
  }

  componentDidMount() {
    const cardRow = this.refs.rowItems;
    const cards = cardRow.getElementsByTagName("section");

    // check if the last card is visible
    const lastCard = cards[cards.length - 1];
    const isCompletelyVisible = this.isCardVisible(lastCard, cardRow, false);

    if (!isCompletelyVisible) {
      this.setState({
        canScrollNext: true,
      });
    }
  }

  handleScroll(cardRow, scrollTarget) {
    const cards = cardRow.getElementsByTagName("section");
    // debugger;
    const animationCallback = timeToScroll => {
      // check the last card
      // if it's fully visible, users can't scroll next
      setTimeout(() => {
        const firstCard = cards[0];
        const lastCard = cards[cards.length - 1];
        const firstCardVisible = this.isCardVisible(firstCard, cardRow, false);
        const lastCardVisible = this.isCardVisible(lastCard, cardRow, false);

        this.setState({
          canScrollNext: !lastCardVisible,
          canScrollPrevious: !firstCardVisible,
        });
      }, timeToScroll);
    };
    // debugger;
    this.scrollCardsAnimated(cardRow, scrollTarget, 200, animationCallback);
  }

  handleScrollPrevious() {
    const cardRow = this.refs.rowItems;
    const cards = cardRow.getElementsByTagName("section");

    let lastVisibleCard;
    let numberOfCardsThatCanFit = 1;
    let newScrollTarget;

    // loop starting at the end to find how many visible cards can fit on the screen
    // This is kind of weird, there should be a simpler way
    for (var i = cards.length - 1; i >= 0; i--) {
      const currentCard = cards[i];
      const currentCardVisible = this.isCardVisible(cards[i], cardRow);
      if (lastVisibleCard && currentCardVisible) {
        numberOfCardsThatCanFit++;
      } else if (lastVisibleCard && !currentCardVisible) {
        // TODO: i + 1? kind of weird
        // it's because we are now past the last card on screen
        // i = index of first card not on screen
        // we don't care about this one, just the number that fit
        const cardIndexToScrollTo = i + 1 - numberOfCardsThatCanFit;
        const newFirstCard = cards[cardIndexToScrollTo];
        const scrollTarget = newFirstCard.offsetLeft - 16;
        this.handleScroll(cardRow, scrollTarget);
        break;
      } else {
        if (currentCardVisible) {
          lastVisibleCard = cards[i];
        }
      }
    }
  }

  handleScrollNext() {
    const cardRow = this.refs.rowItems;

    // loop through the cards to find the first semi-visible card
    // that is where we need to scroll to
    const cards = cardRow.getElementsByTagName("section");

    // loop over items until we find one that is on the screen, then start checking
    // for the next one not fully visible, this is the new target
    // let hasFoundVisibleCard;
    let firstFullVisibleCard;
    let firstSemiVisibleCard;

    for (var i = 0; i < cards.length; i++) {
      if (firstFullVisibleCard) {
        const isSemiVis = !this.isCardVisible(cards[i], cardRow);
        if (isSemiVis) {
          firstSemiVisibleCard = cards[i];
          break;
        }
      } else {
        if (this.isCardVisible(cards[i], cardRow)) {
          firstFullVisibleCard = cards[i];
        }
      }
    }

    //TODO: fix this (16 is the left padding)
    const scrollTarget = firstSemiVisibleCard.offsetLeft - 16;
    this.handleScroll(cardRow, scrollTarget);
  }

  isCardVisible(section, cardRow) {
    // check if a card is fully or partial visible horizontally
    //TODO: handle partial visibility (do we need this?)
    const rect = section.getBoundingClientRect();
    const isVisible = rect.left >= 0 && rect.right <= window.innerWidth;
    // debugger;
    return isVisible;
  }

  scrollCardsAnimated(cardRow, scrollTarget, duration, callback) {
    if (!duration || duration <= diff) {
      cardRow.scrollLeft = scrollTarget;
      if (callback) {
        callback();
      }
      return;
    }

    const component = this;
    const diff = scrollTarget - cardRow.scrollLeft;
    const tick = diff / duration * 10;
    setTimeout(() => {
      cardRow.scrollLeft = cardRow.scrollLeft + tick;
      if (cardRow.scrollLeft === scrollTarget) {
        if (callback) {
          callback();
        }
        return;
      }
      component.scrollCardsAnimated(
        cardRow,
        scrollTarget,
        duration - 10,
        callback
      );
    }, 10);
  }

  render() {
    const { category, names, categoryLink } = this.props;

    return (
      <div className="card-row">
        <div className="card-row__header">
          <h3 className="card-row__title">
            {categoryLink ? (
              <Button
                className="button-text no-underline"
                label={category}
                navigate="/show"
                navigateParams={{ uri: categoryLink }}
              />
            ) : (
              category
            )}

            {category &&
              category.match(/^community/i) && (
                <ToolTip
                  label={__("What's this?")}
                  body={__(
                    'Community Content is a public space where anyone can share content with the rest of the LBRY community. Bid on the names "one," "two," "three," "four" and "five" to put your content here!'
                  )}
                  className="tooltip--header"
                />
              )}
          </h3>
          <div className="card-row__actions">
            <Button
              inverse
              circle
              disabled={!this.state.canScrollPrevious}
              onClick={this.handleScrollPrevious.bind(this)}
              icon="chevron-left"
            />
            <Button
              inverse
              circle
              disabled={!this.state.canScrollNext}
              onClick={this.handleScrollNext.bind(this)}
              icon="chevron-right"
            />
          </div>
        </div>
        <div ref="rowItems" className="card-row__scrollhouse">
          {names &&
            names.map(name => (
              <FileCard
                key={name}
                displayStyle="card"
                uri={lbryuri.normalize(name)}
              />
            ))}
        </div>
      </div>
    );
  }
}

export default CategoryList;
