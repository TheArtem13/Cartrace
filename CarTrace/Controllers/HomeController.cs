using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using CarTrace.Data;
using CarTrace.Models;

namespace CarTrace.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            var model = new MainModel();
            using (var data = new CarTEntities())
            {
                model.Buses = data.Buses.ToList();
            }
            return View(model);
        }
        
        public ActionResult GetBusStops()
        {
            var stopsList = new List<List<double>>();
            //заполняем из БД
            using (var data = new CarTEntities())
            {
                var bs = data.BusStops.ToList();
                foreach(var item in bs)
                {
                    var i = new List<double>();
                    i.Add(item.Lattitude);
                    i.Add(item.Longtitude);
                    stopsList.Add(i);
                }
            }
            var model = JsonConvert.SerializeObject(stopsList); 
            return Content(model);
        }

        public ActionResult GetTrips()
        {
            //var tripList = new List<TripPoint>(); //Долгота, широта, цвет
            var tripList = new List<List<object>>(); //Долгота, широта, цвет, Количество
            //заполняем из БД
            using (var data = new CarTEntities())
            {
                var buses = data.Buses.ToList();
                foreach(var bus in buses)
                {
                    var posadki = data.Trips
                        .Where(x => x.BusId == bus.Number)
                        .GroupBy(x => x.StartId)
                        .ToList();
                    foreach(var ostanovka in posadki)
                    {
                        var i = new List<object>();
                        var thisBus = data.Buses.FirstOrDefault(x => x.Number == bus.Number);
                        if (thisBus != null)
                        {
                            //i.Color = thisBus.Color;
                            i.Add(thisBus.Color);
                            var startId = ostanovka.FirstOrDefault().StartId;
                            
                            var thisStartPoint = data.BusStops.FirstOrDefault(x => x.Id == startId);
                            if (thisStartPoint != null)
                            {
                                //i.Lattitude = thisStartPoint.Lattitude;
                                //i.Longtitude = thisStartPoint.Longtitude;
                                i.Add(thisStartPoint.Lattitude);
                                i.Add(thisStartPoint.Longtitude);
                                i.Add(ostanovka.Count());
                                tripList.Add(i);

                            }
                        }
                    }
                }
                

                //var trips = data.Trips.ToList();
                //foreach (var item in trips)
                //{
                //    //var i = new TripPoint();
                //    var i = new List<object>();
                //    var thisBus = data.Buses.FirstOrDefault(x => x.Number == item.BusId);
                //    if(thisBus != null)
                //    {
                //        //i.Color = thisBus.Color;
                //        i.Add(thisBus.Color);
                //        var thisStartPoint = data.BusStops.FirstOrDefault(x => x.Id == item.StartId);
                //        if(thisStartPoint != null)
                //        {
                //            //i.Lattitude = thisStartPoint.Lattitude;
                //            //i.Longtitude = thisStartPoint.Longtitude;
                //            i.Add(thisStartPoint.Lattitude);
                //            i.Add(thisStartPoint.Longtitude);
                //            tripList.Add(i);

                //        }
                //    }
                //}
            }
            var model = JsonConvert.SerializeObject(tripList);
            return Content(model);
        }
        public ActionResult GetTrafficVolume()
        {
            var tripList = new List<List<object>>();
            using (var data = new CarTEntities())
            {
                var buses = data.Buses.ToList();
                foreach(var bus in buses)
                {
                    var i = new List<object>(); //'name', посадок
                    i.Add(bus.Number.ToString());
                    var trips = data.Trips.Where(x => x.BusId == bus.Number).Count();
                    i.Add(trips);
                    tripList.Add(i);
                }
            }
            var model = JsonConvert.SerializeObject(tripList);
            return Content(model);
        }
        public ActionResult GetSprosVolume()
        {
            var sprosList = new List<SprosModel>();
            using (var data = new CarTEntities())
            {
                foreach(var b in data.Buses.ToList())
                {
                    var newItem = new SprosModel();
                    newItem.bus = b.Number;
                    var pr = 1.0 / b.FactInterval * 12.0 * b.Capacity;
                    newItem.provozn = (int)Math.Round(pr, 0);
                    var trips = data.Trips.Where(x => x.BusId == b.Number).Count();
                    newItem.spros = trips;
                    sprosList.Add(newItem);
                }
            }
            var model = JsonConvert.SerializeObject(sprosList);
            return Content(model);
        }
        public ActionResult GetAnalitycsData()
        {
            var model = new List<RecomendModel>();
            model = new List<RecomendModel>();
            using (var data = new CarTEntities())
            {
                foreach(var bus in data.Buses.ToList())
                {
                    var i = new RecomendModel();
                    i.bus = bus.Number;
                    var posadki = data.Trips
                        .Where(x => x.BusId == bus.Number)
                        .GroupBy(x => x.StartId)
                        .ToList();
                    var Qmax = posadki.Max(x => x.Count());
                    i.Afact = bus.Tob.Value / 2 / bus.FactInterval;
                    i.Am = Qmax * bus.Tob.Value / bus.Capacity;
                    i.I = bus.Tob.Value / i.Am;
                    i.Ifact = bus.FactInterval * 60.0;
                    model.Add(i);
                }
            }
            return PartialView("GetAnalitycsData", model);
        }
    }
}