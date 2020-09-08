const express = require('express');
// const path = require('path');
// const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

var baseURL = "http://cs.hanyang.ac.kr/";
var nbsp = String.fromCharCode(160);

const getHtml = async (url) => {
    try {
        var {data} = await axios({
            url,
            method: "GET",
            responseType: "arraybuffer"
        });
        return await iconv.decode(data, "EUC-KR").toString();
    } catch (error) {
        console.error(error);
    }
}

// get notice list
const getList = (html, page) => {                
    var ulList = [];
    const today = new Date();
    const before2Month = today.setMonth(today.getMonth() - 2);

    const $ = cheerio.load(html);
    const $bodyList = $("#content_box > div > table > tbody").children("tr");
    
    $bodyList.each(function(i, elem) {
        const $child = $(this).children("td");

        // article_idx 가져오기
        var art_idx = $($child[1]).text();
        if (art_idx == "[공지]") {
            if(page > 1) return;
            art_idx = -1;
        }
        else art_idx = parseInt(art_idx);

        // 작성날짜 가져오기 & 2달 전 공지라면 pass
        var dt = $($child[4]).text();
        dt = new Date("20" + dt);
        if(before2Month > dt) return;

        ulList.push({
            article_idx : art_idx,
            date : dt.toISOString().split('T')[0],
            title : $(this).find("td.left > a").text(),
            category : 2,
            url : $(this).find("td.left > a").attr('href')
        });
    });
    return ulList
};

const startCrawling = async () => {
    const URL = [
        "board/info_board.php?ptype=&page=1&code=notice",
        "board/job_board.php?ptype=&page=1&code=job_board",
        "board/gradu_board.php?ptype=&page=1&code=gradu_board",
        "board/trk_board.php?ptype=&page=1&code=trk_board"
    ];
    var result = [];

    for(var u=0; u<URL.length; u++){
        for(var i=1; i<=2; i++){
            var html = await getHtml(baseURL + URL[u].replace("page=1", `page=${i}`));
            var ulList = await getList(html, i);
            result = result.concat(ulList);
        }
    }

    // 날짜순으로 sorting
    result.sort(function (a,b) {
        if(a.date < b.date) return 1;
        if(a.date > b.date) return -1;
        return 0;
    })

    console.log(result.length);
    return result;
    // var contents = await getContents(ulList);
};

// get Contents 
const getContents = async (ulList) => {
    var contents = [];
    for(i = 0; i < ulList.length; i++){
        await getHtml(baseURL + ulList[i]['url']).then(html => {
            const $ = cheerio.load(html);
            const $bodyList = $("#content_box > div > table.bbs_view > tbody").children("tr");


            // get writer & date
            var t = $($bodyList[1]).find("td.view_detail").text();
            t = t.replace(/\n\t\t/gi,'');
            t = t.replace(/ /gi, '');
            var arr = t.split(nbsp);

            var wri = arr[0].split(":")[1];
            var dt = new Date("20" + arr[1].split(":")[1]);
            // console.log(wri, dt);


            var $ct = $($bodyList[2]).find("td.view_content").children();
            // get attatched_text & attatched_url
            var att_title = '';
            var att_url = '';
            if($($ct[0]).is("div.upfile")) {
                att_title = $($ct[0]).find("a").text();
                att_url = $($ct[0]).find("a").attr("href");
                // console.log(att_title, att_url);
            }


            var view_content = '';
            for(j = 1; j < $ct.length; j++){
                view_content += $($ct[j]).text();
            }
            // console.log(view_content);


            contents[i] = {
                title : ulList[i]['title'],
                writer : wri,
                article_idx : i,
                date : dt,
                category : 2,
                contents : view_content,
                attatched_title : att_title,
                attatched_url : att_url
            }

            console.log("complete ", i);
        });
        
    }
    return contents;
};

// TODO
// 1. 해당 공지를 누를 때만 content 가져오기 => URL을 이용해서 가져오기

module.exports = {
    noticeList : function() {
                    return startCrawling();
                }
}