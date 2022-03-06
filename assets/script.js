
//document.addEventListener('DOMContentLoaded', getFilms);

async function getFilms(){



    let requestList = await ftch();

    $('.list-films-wrap').append(setList(requestList?.films || requestList?.items));

    async function ftch(){
        const url = 'https://kinopoiskapiunofficial.tech/';
        const topFilms = 'api/v2.2/films/top';
        const similar = 'api/v2.2/films/301/similars';
        const apiKey = '404dc583-7efc-4c93-8f21-a782f977b9e7';
        return await fetch(url + topFilms + '?type=TOP_AWAIT_FILMS', {
            method: 'GET',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            }
        }).then(r=>r.json()).then(r=> {
            console.log(r)
            return r;
        });
    }

    function setYohoho(id){
        return `
        <div class="film-container">
        <div id="yohoho" data-resize="1" data-tv="1" data-autoplay="1" data-kinopoisk="${id}"></div>
        <script src="//yohoho.cc/yo.js"></script>
        `;
    }

    function setList(list){
        let $listFilms = `<ul class="films-list">`;
        for (let f of list){
            let $li = `<li class="item-film" data-id="${f.filmId}">
                    <div class="image">
                        <img src="${f.posterUrl}" alt="${f.nameRu}">
                    </div>
                    <div class="name">${f.nameRu}</div>
                    <ul class="genres">
                        ${'000'}
                    </ul>
                </li>`;
            $listFilms += $li;
        }
        $listFilms += '</ul>';
        return $listFilms;
    }
    searchByName();
    async function searchByName(){
        const urlMain = 'https://kinopoiskapiunofficial.tech/';
        const url = 'api/v2.1/films/search-by-keyword';
        const apiKey = '404dc583-7efc-4c93-8f21-a782f977b9e7';
        return await fetch(urlMain + url + '?keyword=засланец', {
            method: 'GET',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
                'type' : 'TOP_AWAIT_FILMS',
            }
        }).then(r=>r.json()).then(r=> {
            console.log(r)
            return r;
        });
    }


    $(document).on('click', '.item-film', function (){
        let $film = setYohoho($(this).data('id'));
        $('.film-container-wr').html($film);
    })

}

class OnlineTV{

    apiKey = '404dc583-7efc-4c93-8f21-a782f977b9e7';
    pageMaxNum = 1;
    pageCurrent = 1;
    listUrl = {
        main : 'https://kinopoiskapiunofficial.tech/',
        topFilms : 'api/v2.2/films/top',
        searchByWord : 'api/v2.1/films/search-by-keyword',
        similar : 'api/v2.2/films/301/similars',
        lastUrlItem: '',
        lastUrlItemParams : ''
    }

    async start(){
        let list = await this.apiRequest(this.listUrl.topFilms, {page:1});
        this.pageMaxNum = list?.pagesCount || 1;
        let filmsList = list?.films || list?.items;
        $(document).find('.list-films-wrap .films-list').html(this.setListFilm(filmsList));

        $(document).find('.list-films-wrap').before(this.setPagination(this.pageMaxNum));
        $(document).find('.show-more').after(this.setPagination(this.pageMaxNum));
        this.selectPage();
        this.showMore();
        this.clickShowFilm();
        this.searchByName();
    }
    constructor() {
        this.start();
    }

    async apiRequest(url, params = {}){
        this.listUrl.lastUrlItem = url;
        this.listUrl.lastUrlItemParams = params;
        let basicUrl = new URL(this.listUrl.main + this.listUrl.lastUrlItem);
        let p = new URLSearchParams();
        for (let pp of Object.entries(this.listUrl.lastUrlItemParams)){
            p.append(pp[0], pp[1]);
        }
        basicUrl.search = p.toString();
        let u = basicUrl.href;
        let request = await fetch(u, {
            method: 'GET',
            headers: {
                'X-API-KEY': this.apiKey,
                'Content-Type': 'application/json',
            }
        })
        return request.json();
    }

    setListFilm(list = []){
        if(!list.length) return ;
        let $listFilms = '';
        for (let f of list){
            let $li = `<li class="item-film" data-id="${f.filmId}">
                    <div class="image">
                        <img src="${f.posterUrlPreview}" alt="${f.nameRu}">
                    </div>
                    <span class="rating">${f.rating}</span>
                    <div class="options-wrap">
                        <ul  class="options">
                            <li class="name">${f?.nameRu || f?.nameEn}</li>
                        </ul>
                    </div>
                </li>`;
            $listFilms += $li;
        }
        return $listFilms;
    }

    setPagination(max){
        let html = `<ul class="pagination">`;
        for (let p = 1; p<=max; p++){
            html += `<li class="item"><span class="${p === this.pageCurrent ? 'active' : ''}" data-page="${p}">${p}</span></li>`;
        }
        html += `</ul>`;
        return html;
    }

     selectPage(){
        $(document).on('click', '.pagination [data-page]', async e=>{
            let pi = e.target.dataset.page;
            this.pageCurrent = pi;
            let list = await this.apiRequest(this.listUrl.lastUrlItem, {...this.listUrl.lastUrlItemParams, page:pi});
            this.pageMaxNum = list?.pagesCount || 1;
            let filmsList = list?.films || list?.items;
            $(document).find('.list-films-wrap .films-list').html(this.setListFilm(filmsList));
            $('.pagination [data-page]').removeClass('active');
            $(e.target).addClass('active');

        })
    }

    async showMore(){
        $(document).on('click', '.show-more span', async e=>{
            let pi = $(document).find('.active[data-page]').data('page');
            let nextPage =  pi < this.pageMaxNum ? pi+1 : pi;
            if(nextPage === pi) return;
            let list = await this.apiRequest(this.listUrl.lastUrlItem, {...this.listUrl.lastUrlItemParams, page:nextPage});
            this.pageMaxNum = list?.pagesCount || 1;
            let filmsList = list?.films || list?.items;
            $(document).find('.list-films-wrap .films-list').append(this.setListFilm(filmsList));
            $('.pagination [data-page]').removeClass('active');
            $(`.pagination [data-page="${nextPage}"]`).addClass('active');
        })
    }

    clickShowFilm(){
        let cls = this;
        $(document).on('click', '.item-film', function (){
            let fid = $(this).data('id');
            $('.popup').show();
            $('.popup-stable-text').html(cls.setYohoho(fid));
        })
        $(document).find('.close-b').unbind();
        $(document).on('click', '.close-b', ()=>{
            $('.popup').hide();
            $('.popup-stable-text').html('');
        })
    }

    setYohoho(id){
        return `
            <video data-tv="1" id="yohoho" data-kinopoisk="${id}" controls>
                <source src="//yohoho.cc/yo.mp4" type="video/mp4">
            </video>
            <script src="//yohoho.cc/yo.js"></script>`;
    }

    searchByName(){
        let $f = $('.search-by-name form');
        $f.on('submit', async e=>{
            let search_text = $('#sname').val().trim();
            let list = await this.apiRequest(this.listUrl.searchByWord, {keyword:search_text, page:1});
            this.pageMaxNum = list?.pagesCount || 1;
            let filmsList = list?.films || list?.items;
            $(document).find('.list-films-wrap .films-list').html(this.setListFilm(filmsList));

            $('.pagination').remove();
            $(document).find('.list-films-wrap').before(this.setPagination(this.pageMaxNum));
            $(document).find('.show-more').after(this.setPagination(this.pageMaxNum));

            e.preventDefault();
        })
    }
}
$(()=>{
    new OnlineTV();
})
