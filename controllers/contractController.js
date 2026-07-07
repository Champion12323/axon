import contractService from "../services/contractService.js";
import {
  createContractSchema,
  negotiateContractSchema,
  brandRespondSchema,
  submitMilestoneSchema,
  reviewMilestoneSchema,
  cancelContractSchema,
  disputeContractSchema,
} from "../validations/contractValidation.js";

const createContract = async (req, res, next) => {
  try {
    const data = createContractSchema.parse(req.body);
    const contract = await contractService.createContract(req.io,req.user.id, data);
    res.status(201).json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
};

const sendContract = async (req, res, next) => {
  try {
    const contract = await contractService.sendContract(
      req.io,
      req.user.id,
      req.params.id,
    );
    res.json({ sucess: true, data: contract });
  } catch (err) {
    next(err);
  }
};

const respondToNegotiation = async (req, res, next) => {
  try {
    const data = brandRespondSchema.parse(req.body);
    const contract = await contractService.respondToNegotiation(
      req.io,
      req.user.id,
      req.params.id,
      data,
    );
    res.json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
};

const reviewMilestone = async (req, res, next) => {
  try {
    const data = reviewMilestoneSchema.parse(req.body);
    const milestone = await contractService.reviewMilestone(
      req.io,
      req.user > id,
      req.params.id,
      data,
    );
    re.json({ success: true, data: milestone });
  } catch (err) {
    next(err);
  }
};

// Influencer

const acceptContract = async (req, res, next) => {
  try {
    const contract = await contractService.acceptContract(
      req.io,
      req.user.id,
      req.params.id,
    );
    res.json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
};

const negotiateContract = async (req, res, next) => {
  try {
    const data = negotiateContractSchema.parse(req.body);
    const contract = await contractService.negotiateContract(
      req.io,
      req.user.id,
      req.params.id,
      data,
    );
    res.json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
};

const submitMilestone = async (req, res, next) => {
  try {
    const data = submitMilestoneSchema.parse(req.body);
    const milestone = await contractService.submitMilestone(
      req.io,
      req.user.id,
      req.params.id,
      data,
    );
    res.json({ success: true, data: milestone });
  } catch (err) {
    next(err);
  }
};

//Both

const getContractById = async (req, res, next) => {
  try {
    const contract = await contractService.getContractById(
      req.io,
      req.user.id,
      req.params.id,
    );
    res.json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
};

const getMyContracts = async (req, res, next) => {
  try {
    const contracts = await contractService.getMyContracts(
      req.io,
      req.user.id,
      req.query,
    );
    res.json({ success: true, data: contracts });
  } catch (err) {
    next(err);
  }
};

const cancelContract = async (req, res, next) => {
  try {
    const data = cancelContractSchema.parse(req.body);
    const contract = await contractService.cancelContract(
      req.io,
      req.user.id,
      req.params.id,
      data,
    );
    res.json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
};

const raiseDispute = async (req, res, next) => {
  try {
    const data = disputeContractSchema.parse(req.body);
    const contract = await contractService.disputeContract(
      req.io,
      req.user.id,
      req.params.id,
      data,
    );
    res.json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
};
