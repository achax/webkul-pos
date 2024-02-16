export const HtmlName = ({ name }) => {
  return <span dangerouslySetInnerHTML={{ __html: name }}></span>;
};
