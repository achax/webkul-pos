import { Fragment } from 'react';
import styles from './PlaceHolder.module.scss';

export const PlaceHolder = ({
  count = 12,
  descriptionCount = 1,
  customPlaceHolderClass = null,
  hasImage = true,
  hasDescription = true,
  hasMeta = true,
  hasBorder = true,
  imageHeight = '180px',
  infoWidth = '100%',
  imageWidth = '260px',
  headingHeight = '24px',
  headingWidth = '100%',
  descriptionHeight = '16px',
  descriptionWidth = '100%',
  metaHeight = '13px',
  metaWidth = '100%',
  grid = true,
}) => {
  let list = [];
  for (let i = 0; i < count; i++) {
    list = [
      ...list,
      <li
        key={i}
        className={`${styles.placeholder_item}
        ${hasBorder ? styles.border__box : ''}
        ${grid === false ? styles.list__view : ''} placeholder_item`}
      >
        {hasImage && (
          <div
            className={styles.placeholder_item_media__figure}
            style={{
              '--image-width': imageWidth,
              '--image-height': imageHeight,
            }}
          >
            <span className={styles.placeholder_box}></span>
          </div>
        )}

        <div
          className={styles.placeholder_item__info}
          style={{
            '--info-width': infoWidth,
          }}
        >
          <div className={styles.placeholder_item__content}>
            <h3 className={styles.placeholder_item__headline}>
              <span
                className={styles.placeholder_box}
                style={{
                  '--heading-width': headingWidth,
                  '--heading-height': headingHeight,
                }}
              ></span>
            </h3>
            {hasDescription && (
              <Description
                descriptionCount={descriptionCount}
                descriptionHeight={descriptionHeight}
                descriptionWidth={descriptionWidth}
              />
            )}

            {hasMeta && (
              <div className={styles.placeholder_item__meta}>
                <span
                  className={styles.placeholder_box}
                  style={{
                    '--meta-width': metaWidth,
                    '--meta-height': metaHeight,
                  }}
                ></span>
              </div>
            )}
          </div>
        </div>
      </li>,
    ];
  }

  return (
    <ul className={`${styles.placeholder} ${customPlaceHolderClass}`}>
      {list}
    </ul>
  );
};

export const Description = ({
  descriptionCount,
  descriptionWidth,
  descriptionHeight,
}) => {
  let desc = [];
  for (let i = 0; i < descriptionCount; i++) {
    desc = [
      ...desc,
      <p key={i} className={styles.placeholder_item__description}>
        <span
          className={styles.placeholder_box}
          style={{
            '--description-width': descriptionWidth,
            '--description-height': descriptionHeight,
          }}
        ></span>
      </p>,
    ];
  }
  return <Fragment>{desc}</Fragment>;
};
