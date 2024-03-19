// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MyToken.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract MyExchange {

    using SafeMath for uint256;

    address constant ETHER_VALT = address(0);
    address private contractAdmin;

    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount;
    uint256 public tokenCount;

    mapping(address => mapping(address => uint256)) public deposits;

    mapping(address => uint256) public allTokenIds;
    mapping(uint256 => TokenDat) public allTokenDats;

    mapping(uint256 => OrderDat) public allOrders;
    mapping(uint256 => EscrowDat) public allEscrow;
    mapping(uint256 => bool) public orderFilled;
    mapping(uint256 => bool) public orderCancelled;


    // Events ------------------------------------------------------------------
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timestamp
    );

    // Structs -----------------------------------------------------------------
    struct OrderDat {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }
    struct EscrowDat {
        uint256 id;
        uint256 amount;
    }
    struct TokenDat {
        uint256 id;
        address addr;
        string symbol;
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
        contractAdmin = msg.sender;
    }
    // 
    // Fallback -----------------------------------------------------------------
    receive() external payable {
        revert("Unauthorized Ether deposit reverted via Fallback function");
    }
    modifier adminOnly() {
        require(msg.sender == contractAdmin, 'Contract owner only function');
        _;
    }
    function balanceOf(address _token, address _user) public view returns (uint256) {
        return deposits[_token][_user];
    }
    // 
    // Ether --------------------------------------------------------------------
    function depositEther() public payable {
        deposits[ETHER_VALT][msg.sender] += msg.value;
        emit Deposit(ETHER_VALT, msg.sender, msg.value, deposits[ETHER_VALT][msg.sender]);
    }
    function withdrawEther(uint256 _amount) public {
        require(deposits[ETHER_VALT][msg.sender] >= _amount, "Amount exceeds balance");
        deposits[ETHER_VALT][msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER_VALT, msg.sender, _amount, deposits[ETHER_VALT][msg.sender]);
    }
    // 
    // Token -------------------------------------------------------------------
    function listToken (address _addr, string memory _symbol) public adminOnly {
        tokenCount++;
        allTokenIds[_addr] = tokenCount;
        allTokenDats[tokenCount] = TokenDat(tokenCount, _addr, _symbol);
    }
    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER_VALT, "Invalid token address");
        require(
            MyToken(payable(_token)).transferFrom(msg.sender, address(this), _amount),
            "Token deposit failed"
        );
        deposits[_token][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount, deposits[_token][msg.sender]);
    }
    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER_VALT, "Invalid token address");
        require(
            deposits[_token][msg.sender] >= _amount,
            "Amount exceeds balance"
        );
        deposits[_token][msg.sender] -= _amount;
        require(
            MyToken(payable(_token)).transfer(msg.sender, _amount),
            "Withdrawal failed"
        );
        emit Withdraw(_token, msg.sender, _amount, deposits[_token][msg.sender]);
    }
    // 
    // Order -------------------------------------------------------------------
    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {

        if(_tokenGet == ETHER_VALT){
            require(deposits[_tokenGive][msg.sender] >= _amountGive, "Insufficient tokens on deposit");

            // Is a sell order
            // Hold in escrow
            // Deduct tokens from user deposit
        }

        if(_tokenGet != ETHER_VALT){
            require(deposits[ETHER_VALT][msg.sender] >= _amountGive, "Insufficient ether on deposit");

            // Is a buy order
            // Hold in escrow
            // Deduct ether from user deposit
        }
        
        orderCount += 1;

        allOrders[orderCount] = OrderDat(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }
    function cancelOrder(uint256 _id) public {

        require(_id > 0 && _id <= orderCount, "Invalid order ID");
        
        OrderDat storage _order = allOrders[_id];

        if(_order.tokenGet == ETHER_VALT){
            // Is a sell order
            // Add back tokens to user deposit -> remove from escrow
        }

        if(_order.tokenGet != ETHER_VALT){
            // Is a buy order
            // Add back ether to user deposit -> remove from escrow
        }

        require(_order.id == _id, "Order not found");
        require(orderFilled[_id] == false, "Order already filled");
        require(orderCancelled[_id] == false, "Order already cancelled");
        require(address(_order.user) == msg.sender, "This user may not cancel");
        
        orderCancelled[_id] = true;
        
        emit Cancel(
            _order.id,
            msg.sender,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive,
            block.timestamp
        );
    }
    function fillOrder(uint256 _id) public {
        
        require(_id > 0 && _id <= orderCount, "Invalid order ID");
        
        OrderDat storage _order = allOrders[_id];

        require(_order.id == _id, "Order not found");
        require(orderFilled[_id] == false, "Order already filled");
        require(orderCancelled[_id] == false, "Order already cancelled");
        require(address(_order.user) != msg.sender, "This user may not fill");

        _trade(
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );
    }
    // 
    // Audits -------------------------------------------------------------------
    function feeAmount(uint256 _amountGet) public view returns (uint256) {
        return _amountGet.mul(feePercent).div(100);
    }
    function totalAmount(uint256 _amountGet) public view returns (uint256) {
        uint256 _feeAmt = feeAmount(_amountGet);
        return _amountGet.add(_feeAmt);
    }
    function fillerBalance(address _tokenGet, address _fillerAddr) public view returns (uint256) {
        uint256 _fillerBalance = deposits[_tokenGet][_fillerAddr];
        return _fillerBalance;
    }
    // 
    // Internal ----------------------------------------------------------------
    function _trade(
        uint256 _orderId,
        address _orderUser,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {

        uint256 _feeAmt = (_amountGet * feePercent) / 100;
        uint256 _totalAmount = _amountGet + _feeAmt;
        uint256 _fillerBalance = deposits[_tokenGet][msg.sender];

        require(_fillerBalance >= _totalAmount, "Insufficient balance for trade and fee");

        deposits[_tokenGet][msg.sender] -= _totalAmount;
        deposits[_tokenGive][msg.sender] += _amountGive;

        deposits[_tokenGet][_orderUser] += _amountGet;
        deposits[_tokenGive][_orderUser] -= _amountGive;
        
        deposits[_tokenGet][feeAccount] += _feeAmt;

        orderFilled[_orderId] = true;

        emit Trade(
            _orderId,
            _orderUser,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            msg.sender,
            block.timestamp
        );
    }
}

