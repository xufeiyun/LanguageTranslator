var CLEAR_GIF = 'data:image/gif;' + 'base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

var DEFAULT_LOGO = CLEAR_GIF;
var DEFAULT_PRODUCT = CLEAR_GIF;

var MinimalAd = function() {
  this.baseAnchor = document.getElementById('adDestination');
  this.logoArea = document.getElementById('logoArea');
  this.logo = document.getElementById('logo');

  // Set up logo.
  this.logo.src = DEFAULT_LOGO;
  this.logoFillImage = new FillImage(this.logoArea, this.logo);

  // Set up a background
  var adAreaEl = document.getElementsByClassName('adArea')[0];
  this.adAreaBg = adAreaEl.cloneNode(false /* not deep */);
  this.adAreaBg.className += ' adSize';
  this.adAreaBg.style.position = 'absolute';
  this.adAreaBg.style.zIndex = -1;
  adAreaEl.parentNode.insertBefore(this.adAreaBg, adAreaEl);

  // Set up a local style element for css class overrides.
  this.localStyle = document.createElement('style');
  this.localStyle.type = 'text/css';
  document.head.appendChild(this.localStyle);

  // Configure products.
  this.products = [];
  var productElements = this.baseAnchor.querySelectorAll('.product');
  for (var i = 0, l = productElements.length; i < l; ++i) {
    this.products.push(new Product(this, productElements[i]));
  }
};

/**
 * Configures the visual elements for the Minimal template.
 */
MinimalAd.prototype.setAdData = function(adData) {

  // Flatten the hierarchy for template data.
  var rawData = adData.google_template_data.adData[0];
  var templateAdData = getStructuredData(rawData);

  // Configure the base link.
  this.baseAnchor.target = '_top';
  this.googleClickUrl = adData.google_click_url;

  // We register a listener for clicks in the body with useCapture=true
  // so that it won't trigger if any other click listener with
  // useCapture=false has already consumed the event.
  var thisRef = this;
  document.body.addEventListener('click', function() {
    // Sets the global location back to the destination URL if the
    // Headline_0_productClickOnly field value is false.
    if (templateAdData.Headline[0]['productClickOnly'] == 'FALSE') {
      thisRef.setDestination(adData.destination_url);
    }
  }, true);

  // Sets the global location back to the first product URL or to the
  // destination URL if there is no product URL.
  var firstProductUrl = templateAdData.Product[0].url;
  this.setDestination(firstProductUrl || adData.destination_url);

  this.setDesign(templateAdData.Design[0]);
  this.setProducts(templateAdData.Product);
};

MinimalAd.prototype.setDestination = function(destinationUrl) {
  var clickDomains = ['googleads.g.doubleclick.net',
    'adclick.g.doubleclick.net',
    'www.googleadservices.com',
    'adclick.googleadservices.com'];
  var isClickUrl = clickDomains.some(function(domain) {
    return destinationUrl.indexOf(domain) != -1;
  });
  this.baseAnchor.href = isClickUrl ?
      destinationUrl : this.googleClickUrl + encodeURIComponent(destinationUrl);
};

MinimalAd.prototype.setDesign = function(designData) {
  this.applyLogoStyles_(designData);
  this.applyBackgroundStyles_(designData);

  // Reset the local css overrides.
  var newLocalStyleHtml = '';

  // Set rounded corners.
  if (designData.cornerStyle && designData.cornerStyle == 'square') {
    newLocalStyleHtml += '.roundedCorners { border-radius: 0; }';
  }

  // Apply css overrides.
  this.localStyle.innerHTML = newLocalStyleHtml;
};

MinimalAd.prototype.applyLogoStyles_ = function(designData) {
  this.logo.src = designData.logoImageUrl || DEFAULT_LOGO;
  this.logoFillImage.setAdditionalPadding(designData.logoPadding);
};

MinimalAd.prototype.applyBackgroundStyles_ = function(designData) {
  this.adAreaBg.style.backgroundColor =
      normalizeHexColor(designData.bgColor) || '';
  this.adAreaBg.style.backgroundImage = cssUrl(designData.bgImageUrl) || '';
  this.adAreaBg.style.opacity = designData.bgAlpha || '';
};

MinimalAd.prototype.setProducts = function(products) {
  for (var i = 0, length = this.products.length; i < length; ++i) {
    this.products[i].setData(products[i] || {});
  }
};

/**
 * Returns a structured object where fields with name pattern
 * element_0_attribute are folded into a data[element][0][attribute]
 * object structure.
 *
 * @param {Object} rawData the 'adData' element from the adData object.
 */
function getStructuredData(rawData) {
  var dataObject = {};
  for (var datum in rawData) {
    var parts = datum.split(/_/);
    var element = parts.shift();
    var index = Number(parts.shift());
    var attribute = parts.join('');

    if (element && !isNaN(index) && attribute) {
      // Structured element.
      if (!dataObject[element]) {
        dataObject[element] = [];
      }
      if (!dataObject[element][index]) {
        dataObject[element][index] = {};
      }
      dataObject[element][index][attribute] = rawData[datum];
    } else {
      // Top-level element.
      dataObject[datum] = rawData[datum];
    }
  }
  return dataObject;
}

function normalizeHexColor(dataColor) {
  return dataColor ? dataColor.replace(/0x/, '#') : undefined;
}

function cssUrl(url) {
  return url ? 'url("' + url + '")' : undefined;
}

function pxToNumber(pxString) {
  return Number(pxString.replace(/px/, ''));
}

function Product(ad, baseDiv) {
  this.ad = ad;
  this.baseDiv = baseDiv;
  this.image = baseDiv.querySelector('.productImage');
  this.linkUrl = '';
  this.fillImage = new FillImage(this.baseDiv, this.image);

  var thisRef = this;
  this.baseDiv.addEventListener('mouseover', function() {
    thisRef.setProductDestination();
  }, false);
  // This listener takes precedence over the body click listener that has
  // userCapture=true, guaranteeing that this will run when clicking on the
  // product.
  this.baseDiv.addEventListener('click', function() {
    thisRef.setProductDestination();
  }, false);

  this.image.src = DEFAULT_PRODUCT;
}

Product.prototype.setProductDestination = function() {
  if (this.linkUrl) {
    // Set the global location to this product url.
    this.ad.setDestination(this.linkUrl);
  }
};

Product.prototype.setData = function(productData) {
  this.image.src = productData.imageUrl || DEFAULT_PRODUCT;
  this.linkUrl = productData.url;
};

/**
 * An image that fills its bounding element but maintains aspect ratio.
 */
function FillImage(baseDiv, image) {
  this.originalClass = image.className || '';
  this.baseDiv = baseDiv;
  this.image = image;
  this.additionalPadding = 0;

  var baseDivStyle = window.getComputedStyle(this.baseDiv);
  this.originalPadding = pxToNumber(baseDivStyle.padding);
  this.originalWidth = pxToNumber(baseDivStyle.width);
  this.originalHeight = pxToNumber(baseDivStyle.height);

  var thisRef = this;
  image.addEventListener('load', function() {
    thisRef.updateSize();
  }, false);

  this.updateSize();
}

/**
 * Sets additional padding for the image within the baseDiv.
 */
FillImage.prototype.setAdditionalPadding = function(paddingInPixels) {
  this.additionalPadding = Number(paddingInPixels);

  this.updateSize();
};

/**
 * Simulates setting the padding around the image, while keeping the
 * size of the container the same.
 */
FillImage.prototype.adjustPadding = function() {
  this.baseDiv.style.padding = (this.originalPadding +
      this.additionalPadding) + 'px';

  this.baseDiv.style.width = (this.originalWidth -
      2 * this.additionalPadding) + 'px';

  this.baseDiv.style.height = (this.originalHeight -
      2 * this.additionalPadding) + 'px';
};

FillImage.prototype.updateSize = function() {
  // Adjust padding first, so we get correct measurements.
  this.adjustPadding();

  var baseStyle = window.getComputedStyle(this.baseDiv);
  var baseWidth = pxToNumber(baseStyle.width);
  var baseHeight = pxToNumber(baseStyle.height);
  var baseAspectRatio = baseWidth / baseHeight;

  // Reset the class before measuring the image.
  this.image.className = this.originalClass;

  var imageWidth = this.image.width;
  var imageHeight = this.image.height;
  var imageAspectRatio = imageWidth / imageHeight;

  // Ensure image fills in appropriate direction.
  var imageClass;
  if (imageAspectRatio > baseAspectRatio) {
    imageClass = ' wide';
  } else {
    imageClass = ' tall';
  }

  this.image.className = this.originalClass + imageClass;

  // Vertical Centering.
  // Adjust height margins. Width is handled in css by 'margin: auto'.
  var imageStyle = window.getComputedStyle(this.image);
  var imageStyledHeight = pxToNumber(imageStyle.height);
  var newTopMargin = Math.round((baseHeight - imageStyledHeight) / 2);

  this.image.style.marginTop = newTopMargin + 'px';
};
