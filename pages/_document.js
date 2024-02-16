import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            rel="manifest"
            href="/manifest.json"
            crossOrigin="use-credentials"
            id="manifest"
          />
          <link
            rel="shortcut icon"
            href="/favicon.ico"
            type="image/x-icon"
          ></link>
          <link
            rel="icon"
            href="/favicon.ico"
            type="image/x-icon"
            sizes="any"
          ></link>
          <meta name="theme-color" content="#fff" />
        </Head>
        <body
          className={process.env.MODE === 'production' ? 'hide-overlay' : ''}
        >
          <Main />
          <div id="loader" />
          <div id="alerts" />
          <NextScript />
        </body>
      </Html>
    );
  }
}
