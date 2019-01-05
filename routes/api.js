const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../models/Article');
const Note = require('../models/Note');

module.exports = (app) => {
  app.get('/api/headlines', (req, res) => {
    if(req.query.saved === 'true') {
      Article.find({__v: true})
       .then( articles => {
         res.status(200).json(articles);
       }).catch( err => {
         console.log(err);
       });
    } else if (req.query.saved === 'false') {
      Article.find({__v: false})
       .then( articles => {
         res.status(200).json(articles);
       }).catch( err => {
         console.log(err);
       });
    }
  });

  app.put('/api/headlines/:id', (req, res) => {
    const id = req.params.id ;
    Article.findByIdAndUpdate(
      id, { 
        __v: true 
      }, 
      (err, result) => {
        if (err) console.log(err);
        res.send(result);
    });
  });

  app.delete('/api/headlines/:id', (req, res) => {
    const id = req.params.id;
    Article.findByIdAndDelete(id, (err, response) => {
      if (err) console.log(err);
      res.json(response);
    })
  });

  app.get('/api/notes/:id', (req, res) => {
    Article.findById(req.params.id)
      .populate('notes')
      .then((Article) => {
        res.json(Article.notes);
      }).catch((err) => {
        res.json(err);
      });
  });

  app.post('/api/notes', (req, res) => {
    Note.create(req.body)
      .then((dbNote) => {
        return Article.findOneAndUpdate(
          { _id: req.body._headlineId},
          { $push: { notes: dbNote._id } },
          { new: true }
        );
      }).then((Article) => {
        res.json(Article);
      }).catch((err) => {
        res.json(err);
      });
  });

  app.delete('/api/notes/:id', (req, res) => {
    Note.findOneAndDelete(req.params.id)
      .then(response => res.json(response))
      .catch(err => res.json(err))
  });

  app.get('/api/fetch', (req, res) => {
    axios.get('https://www.nytimes.com/').then( response => {
      const $ = cheerio.load(response.data);
      const articles = [];
      $('div.css-6p6lnl').each( (i, element) => {
        if (i > 4) return;
        let article ={};
        article.headline = $(element).find('h2').text();
        article.summary = $(element).text();
        article.url = $(element).find('a').attr('href');
        Article.update({
          headline: article.headline
        }, 
        article, 
        {
          upsert: true
        })
        .catch((err) => {
          console.log(err)
        });
      });
      res.status(200).json(articles);
    });
  });

  app.get('/api/clear', (req, res) => {
    Article.collection.deleteMany({}).then(() => {
      Note.collection.deleteMany({}).then((response) => {
        res.status(200).json(response);
      }).catch((err) => {
        console.log(err);
      });
    }).catch( (err) => {
      console.log(err);
    });
  });

}