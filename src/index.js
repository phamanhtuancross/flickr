import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ReactDOM from 'react-dom';
import InfiniteScroll from 'react-infinite-scroller';
import './index.css';
import Gallery from 'react-grid-gallery';

//const stringFormat = (...args) => args.shift().replace(/%([jsd])/g, x => x === '%j' ? JSON.stringify(args.shift()) : args.shift());
//let URL_DOWNLOAD_PHOTO_TEMPLATE = 'https://farm%s.staticflickr.com/%s/%s_%s_b.jpg";'
let FLICKR_API_KEY = 'cf9e78cc066051745368d659ef17c403';
let FLICKR_API = 'flickr.interestingness.getList';
let FLICKR_URL_TEMPLATE = 'https://api.flickr.com/services/rest/?method=' + FLICKR_API + '&api_key=' + FLICKR_API_KEY + '&format=json&nojsoncallback=1&text=cats&extras=url_z,views';
let PAGE_SZIE = 20;

class FlickrApplication extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            hasMoreItems: true,
            currentPage: 1,
        };
    }

    componentDidMount() {

    }

    renderTopPhotos() {

        let photoComponents = [];
        let photos = this.state.photos.slice();
        for (let photoIndex = 0; photoIndex < photos.length; photoIndex++) {
            let title = photos[photoIndex].owner + '|' + photos[photoIndex].views + 'Views';
            photoComponents.push(
                {
                    src: photos[photoIndex].url,
                    thumbnail: photos[photoIndex].url,
                    thumbnailWidth: photos[photoIndex].width_z,
                    thumbnailHeight: photos[photoIndex].height_z,
                    tags: [{value:  photos[photoIndex].owner, title: title} ],
                    caption: photos[photoIndex].title,

                }
            );
        }
        return photoComponents;
    }

    loadItems(page) {
        var self = this;
        var FLICKR_URL  = FLICKR_URL_TEMPLATE + '&per_page='+ PAGE_SZIE  + '&page='+ this.state.currentPage;

        axios.get(FLICKR_URL).then(res => {
            if(res) {
                let items = res.data.photos.photo;
                console.log(res.data);
                let photos = this.state.photos.slice();
                for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {

                    let item = items[itemIndex];
                    let photoDtoObj = {
                        farm: item.farm,
                        id: item.id,
                        isfamily: item.isfamily,
                        isfriend: item.isfriend,
                        ispublic: item.ispublic,
                        owner: item.owner,
                        secret: item.secret,
                        server: item.server,
                        title: item.title,
                        url: item.url_z,
                        height_z: item.height_z,
                        width_z: item.width_z,
                        views: item.views,
                    };

                    photos.push(photoDtoObj);
                }




                if(self.state.currentPage < res.data.photos.pages){
                    var currentPage = this.state.currentPage +  1;

                    this.setState({
                        photos: photos,
                        currentPage: currentPage,
                    });
                }
                else{
                    self.setState({
                        hasMoreItems: false,
                    });
                }


                console.log(photos);
            }
        });
    }

    setCustomTags (i) {
        return (
            i.tags.map((t) => {
                return (<div
                    key={t.value}
                    style={customTagStyle}>
                    {t.title}
                </div>);
            })
        );
    }


    render() {
        const loader = <div className="loader" key={0}></div>;
        var images =
            this.renderTopPhotos().map((i) => {
                i.customOverlay = (
                    <div style={captionStyle}>
                        <div>{i.caption}</div>
                        {i.hasOwnProperty('tags') &&
                        this.setCustomTags(i)}
                    </div>);
                return i;
            });
        return (
            <div>
                <div id="nav">
                    <ul>
                        <li><a href="#news">FLICKR</a></li>
                        <li><a href="#contact">Explore</a></li>
                        <li><a href="#about">Help</a></li>
                    </ul>
                </div>
                <div>
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={this.loadItems.bind(this)}
                        hasMore={this.state.hasMoreItems}
                        loader={loader}
                    >

                        <div style={{
                            display: "block",
                            minHeight: "1px",
                            width: "100%",
                            border: "1px solid #ddd",
                            overflow: "auto"}}>
                            <Gallery
                                images={images}
                                enableImageSelection={true}/>
                        </div>

                    </InfiniteScroll>
                </div>
            </div>

        );
    }
}

FlickrApplication.propTypes = {
    images: PropTypes.arrayOf(
        PropTypes.shape({
            src: PropTypes.string.isRequired,
            thumbnail: PropTypes.string.isRequired,
            srcset: PropTypes.array,
            caption: PropTypes.string,
            thumbnailWidth: PropTypes.number.isRequired,
            thumbnailHeight: PropTypes.number.isRequired
        })
    ).isRequired
};

const captionStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    overflow: "hidden",
    position: "absolute",
    bottom: "0",
    width: "100%",
    color: "white",
    padding: "2px",
    fontSize: "90%"
};

const customTagStyle = {
    wordWrap: "break-word",
    display: "inline-block",
    backgroundColor: "white",
    height: "auto",
    fontSize: "75%",
    fontWeight: "600",
    lineHeight: "1",
    padding: ".2em .6em .3em",
    borderRadius: ".25em",
    color: "black",
    verticalAlign: "baseline",
    margin: "2px"
};
ReactDOM.render(
    <FlickrApplication images={}/>,
    document.getElementById('root')
);