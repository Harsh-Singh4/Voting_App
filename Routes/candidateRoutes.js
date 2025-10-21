const express = require('express');
const router = express.Router();
const Candidate = require('../Models/Candidate');
const User = require('../Models/User');

const {jwtAuthMiddleware, generateToken} = require('./../jwt');

const checkAdminRole = async(userID) =>{
try{
const user =await User.findById(userID);
return user.role=='admin';
}
catch(err){
    return false;
}
}

// POST route to add a candidate
router.post('/',jwtAuthMiddleware,async (req, res) =>{
    try{

        if(!await checkAdminRole(req.user.id)){
          return res.status(404).json({message:'user does not have an admin role'});

        }
        const data = req.body // Assuming the request body contains the User data

    
        // Create a new Candidate document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new Candidate to the database
        const response = await newCandidate.save();
        console.log('data saved');

        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.put('/:candidateID',jwtAuthMiddleware, async (req, res) => {
    try {
        if(!checkAdminRole(req.user.id)){
          return res.status(403).json({message:'user does not have an admin role'});

        }

        const candidateID = req.params.candidateID; 
        const updatedCandidateData =req.body;

         const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!checkAdminRole(req.user.id))
            return res.status(403).json({message: 'user does not have admin role'});
        
        const candidateID = req.params.candidateID; // Extract the id from the URL parameter

        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    candidateID = req.params.candidateID;
     userID= req.user.id;

    try{
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({message :'Candidate not found'});
        }

        const user = await User.findById(userID);

        if(!user){
            return res.status(404).json({message:'user not found'});
        }

        if(user.isVoted){
            res.status(400).json({message:'You have already voted'});
        }

        if(user.role=='admin'){
            res.status(403).json({message:'admin is not allowed'});
        }
      candidate.votes.push({ User: userID });
candidate.voteCount++;
await candidate.save();  // Save the candidate document instance

user.isVoted = true;
await user.save();       // Save the user document instance

        res.status(200).json({message:"Vote recorded successfully"});
        }
    catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
});


router.get('/vote/count',async(req,res)=>{
  try{
   const candidate=await Candidate.find().sort({voteCount:'desc'});
   
   const voteRecord = Candidate.map((data)=>{
    return{
        party:data.party,
        count:data.voteCount
    }
   });
   return res.status(200).json({voteRecord});
  }
  catch(err){
    console.log(err);
    res.status(500).json({error:"Internal Server Error"});
  }
});


module.exports = router;