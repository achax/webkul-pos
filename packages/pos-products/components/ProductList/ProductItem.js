import { Thumbnail } from '@webkul/pos-ui';
import styles from './ProductItem.module.scss';
import { getFormattedPrice } from '~/utils/Helper';
import ReactTooltip from 'react-tooltip';

const ProductItem = ({ item, onClick }) => {

  return (
    <>
      <div className={styles.product_item_container}>
        {
          <div
            className={styles.product_container}
            onClick={() => onClick(item)}
          >
            <div className={styles.product_info}>
              <div>
                <Thumbnail
                  alt="Product Logo"
                  width={125}
                  height={125}
                  thumbnail={item.thumbnail}
                />
              </div>
              <div className={styles.product_details}>
                <div
                  className={styles.name_section}
                  data-tip={item?.name}
                  data-place="bottom"
                  data-type="light"
                >
                  <Name name={item?.name} />
                </div>
                <div className={styles.price_section}>
                  <b>{getFormattedPrice(item.final_price)}</b>
                </div>
              </div>
            </div>
          </div>
        }

        <ReactTooltip />
      </div>
    </>
  );
};

export default ProductItem;

const Name = ({ name }) => {
  return (
    <>
      <h3 dangerouslySetInnerHTML={{ __html: name }}></h3>
    </>
  );
};
