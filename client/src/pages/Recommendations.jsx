import React from 'react';

function Recommendations() {
  return (
    <div>
      <h2>Recommendations</h2>
      <p>Discover destinations based on your preferences.</p>
      <div className="alert alert-info">
        This page will contain AI-driven travel recommendations.
      </div>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card">
            <img src="https://via.placeholder.com/300x200" className="card-img-top" alt="Destination" />
            <div className="card-body">
              <h5 className="card-title">Beach Vacation</h5>
              <p className="card-text">Relax and unwind at beautiful beaches.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card">
            <img src="https://via.placeholder.com/300x200" className="card-img-top" alt="Destination" />
            <div className="card-body">
              <h5 className="card-title">Mountain Retreat</h5>
              <p className="card-text">Explore scenic mountain landscapes.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card">
            <img src="https://via.placeholder.com/300x200" className="card-img-top" alt="Destination" />
            <div className="card-body">
              <h5 className="card-title">City Exploration</h5>
              <p className="card-text">Discover vibrant city cultures.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recommendations;