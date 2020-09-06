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
const getList = async () => {
    var ulList = [];
    await getHtml(baseURL + "board/info_board.php?ptype=&page=1&code=notice").then(html => {
        const $ = cheerio.load(html);
        const $bodyList = $("#content_box > div > table > tbody").children("tr");
    
        $bodyList.each(function(i, elem) {
            ulList[i] = {
                title : $(this).find("td.left > a").text(),
                url : $(this).find("td.left > a").attr('href')
            };
        });
    });
    return ulList
};

// get Contents 
const getContents = async () => {
    var contents = [];
    await getList().then(async ulList => {
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
                    category : '학사일반 게시판',
                    contents : view_content,
                    attatched_title : att_title,
                    attatched_url : att_url
                }
    
                console.log("complete ", i);
            });
            
        }
    });
    return contents;
};

module.exports = (async function() {
    return getContents();
})()