/**
 * 整机订单任务分配
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
//import  OrderList from './OrderList';
import Loading from '../components/Loading';
import {queryMovies} from '../components/Refresh/Service';
import MovieItemCell from "../components/Refresh/MovieItemCell";
import RefreshListView from "../components/Refresh/RefreshListView";
import RefreshState from "../components/Refresh/RefreshState";
import  { httpFetch }  from '../components/Fetch';

class OrderAllocationList extends Component {
  static navigationOptions = {
    title: '任务分配',
    // header: null,
    // gesturesEnabled: false //是否可以使用手势关闭此屏幕。在iOS上默认为true，在Android上为false
  };
  constructor(props) {
      super(props);
      this.state = {
        movieList: [],  // 电影列表的数据源
        startPage: 0,   // 从第几页开始加载
        pageSize: 5,   // 每页加载多少条数据
      }
  }
  componentDidMount() {
   this.listView.beginHeaderRefresh();
 }

  render() {
    let userInfo = this.props.userInfo;
    return (
      <RefreshListView
        ref={(ref) => {this.listView = ref}}
        data={this.state.movieList}
        renderItem={this._renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={this._renderEmptyView}
        onHeaderRefresh={() => { this.loadDisplayingMovies() }}
        onFooterRefresh={() => { this.loadDisplayingMovies() }}
      />

    );

  }



  _renderItem = (item) => {
    return (
      <MovieItemCell movie={item.item} onPress={() => {
        console.log('点击了电影----', item);
      }}/>
    )
  };

  /// 渲染一个空白页，当列表无数据的时候显示。这里简单写成一个View控件
  _renderEmptyView = (item) => {
    return <View/>
  };

  /**
   * 加载正在上映的电影列表，此处默认城市为北京，取20条数据显示
   */
  loadDisplayingMovies() {

    let that = this;
    fetch(queryMovies('北京', this.state.startPage, this.state.pageSize)).then((response) => response.json()).then((json) => {
      //console.log(json);
      let movies = [];
      for (let idx in json.subjects) {
        let movieItem = json.subjects[idx];
        let directors = ""; // 导演
        for (let index in movieItem.directors) {
          // 得到每一条电影的数据
          let director = movieItem.directors[index];
          // 将多个导演的名字用空格分隔开显示
          if (directors === "") {
            directors = directors + director.name
          } else {
            directors = directors + " " + director.name
          }
        }
        movieItem["directorNames"] = directors;

        // 拼装主演的演员名字，多个名字用空格分隔显示
        let actors = "";
        for (let index in movieItem.casts) {
          let actor = movieItem.casts[index];
          if (actors === "") {
            actors = actors + actor.name
          } else {
            actors = actors + " " + actor.name
          }
        }
        movieItem["actorNames"] = actors;
        movies.push(movieItem)
      }

      console.log(movies);
      // 获取总的条数
      let totalCount = json.total;

      // 当前已经加载的条数
      let currentCount = this.state.movieList.length;

      // 根据已经加载的条数和总条数的比较，判断是否还有下一页
      let footerState = RefreshState.Idle;
      let startPage = this.state.startPage;
      if (currentCount + movies.length < totalCount) {
        // 还有数据可以加载
        footerState = RefreshState.CanLoadMore;
        // 下次加载从第几条数据开始
        startPage = startPage+ movies.length;
      } else {
        footerState = RefreshState.NoMoreData;
      }
      // 更新movieList的值
      let movieList = this.state.movieList.concat(movies);
      that.setState({
        movieList: movieList,
        startPage: startPage
      });
      that.listView.endRefreshing(footerState);
    }).catch((e) => {
      console.log("加载失败");
      that.listView.endRefreshing(RefreshState.Failure);
    }).done();
  }

}


function mapStateToProps(state) {
    //console.log(state.userInfo);
    return {
        userInfo: state.userInfo
    }
}

function mapDispatchToProps(dispatch) {
    return {
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OrderAllocationList)
