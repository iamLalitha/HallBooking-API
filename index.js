const express=require('express');
const bodyParser=require('body-parser');

const app=express();
const PORT=3001;

app.use(bodyParser.json());

//temporary storage for rooms and bookings 
let rooms=[];
let bookings=[];

// Define a route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Hall Booking API!');
  });

//creating a new room
app.post('/rooms',(req,res)=>{
    const {seats,amenities,pricePerhour}=req.body;
    const room={
        id:rooms.length+1,
        seats,
        amenities,
        pricePerhour,
    };
    rooms.push(room);
    res.status(201).json(room);
});

//to book a room
app.post('/bookings',(req,res)=>{
    const{customerName,date,startTime,endTime,roomId}=req.body;

    //room available or not checking 
    const isRoomAvailable=bookings.every(booking=>{
        return(
            booking.roomId!== roomId ||
            booking.date !== date ||
            (startTime >= booking.startTime && startTime <=booking.endTime) ||
            (endTime>= booking.startTime && endTime <= booking.endTime)
            
        )
    });
    if(!isRoomAvailable){
        return res.status(400).json({message:'room is already booked for the given date and time'});

    }
    const booking={
        id:bookings.length+1,
        customerName,
        date,
        startTime,endTime,roomId,
    };
    bookings.push(booking);
    res.status(201).json(booking);
});

//to get the list of all rooms with booked data
app.get('/rooms/bookings',(req,res)=>{
    const roomBookings=rooms.map(room=>{
        const bookingsForRoom= bookings.filter(booking=>booking.roomId===room.id);
        return{
            ...room,
            bookings:bookingsForRoom,
        };
    });
    res.json(roomBookings);
});

//to get the list of all customers with booked data
app.get('/customers/bookings',(req,res)=>{
    const customerBookings=bookings.map(booking=>{
        const room =rooms.find(room=>room.id===booking.roomId);
        return{
            customerName: booking.customerName,
            roomName:room? `Room ${room.id}`:'unknown room',
            date:booking.date,
            startTime:booking.startTime,
            endTime:booking.endTime,
        };
    });
    res.json(customerBookings);
});

//to get the no.of times a customer has booked a room
app.get('/customers/:customerName/bookings',(req,res)=>{
    const{customerName}=req.params;
    const customerBookings=bookings.filter(booking=>booking.customerName===customerName);
    res.json(customerBookings);
});

//to start the server
app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})