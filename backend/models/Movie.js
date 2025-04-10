module.exports = (sequelize, DataTypes) => {
  const Movie = sequelize.define('Movie', {
    imdbId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER
    },
    plot: DataTypes.TEXT,
    director: DataTypes.STRING,
    actors: DataTypes.ARRAY(DataTypes.STRING),
    genre: DataTypes.ARRAY(DataTypes.STRING),
    poster: DataTypes.STRING,
    imdbRating: DataTypes.FLOAT,
    userRating: {
      type: DataTypes.FLOAT,
      validate: {
        min: 0,
        max: 10
      }
    },
    watched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    watchDate: DataTypes.DATE,
    notes: DataTypes.TEXT,
    favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  });

  return Movie;
};