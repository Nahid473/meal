
/* =========================================================
   STORAGE
========================================================= */

let members =
    JSON.parse(
        localStorage.getItem("mess_members_v4")
    ) || [];

let meals =
    JSON.parse(
        localStorage.getItem("mess_meals_v4")
    ) || [];

let bazars =
    JSON.parse(
        localStorage.getItem("mess_bazars_v4")
    ) || [];

let expenses =
    JSON.parse(
        localStorage.getItem("mess_expenses_v4")
    ) || [];

let deposits =
    JSON.parse(
        localStorage.getItem("mess_deposits_v4")
    ) || [];

/* =========================================================
   OLD DATA MIGRATION
========================================================= */

members.forEach(m=>{
    if(typeof m.active === "undefined"){
        m.active = true;
    }
});

meals.forEach(m=>{
    if(!Array.isArray(m.extras)){
        m.extras = [];
    }
});

saveData();

/* =========================================================
   NAVIGATION
========================================================= */

function showPage(page,button){

    document
        .querySelectorAll(".page")
        .forEach(p=>{
            p.classList.remove("active");
        });

    const target =
        document.getElementById(page);

    if(target){
        target.classList.add("active");
    }

    document
        .querySelectorAll(".menu button")
        .forEach(b=>{
            b.classList.remove("active");
        });

    if(button){
        button.classList.add("active");
    }

    const titles={
        dashboard:"Dashboard",
        members:"Members",
        meals:"Daily Meals",
        bazar:"Bazar",
        expenses:"Expenses",
        deposits:"Joma / Payment",
        calculation:"Final Calculation",
        reports:"Reports"
    };

    document.getElementById("pageTitle")
        .innerText =
        titles[page] || "Dashboard";

    updateAll();

    if(page==="meals"){

        if(!document.getElementById("mealDate").value){
            document.getElementById("mealDate").value=today();
        }

        renderMealCards();
    }

    document
        .getElementById("sidebar")
        .classList.remove("show");
}

function toggleSidebar(){

    document
        .getElementById("sidebar")
        .classList.toggle("show");
}

/* =========================================================
   MEMBER
========================================================= */

function addMember(){

    const mill =
        document.getElementById("memberMill")
        .value.trim();

    const name =
        document.getElementById("memberName")
        .value.trim();

    const phone =
        document.getElementById("memberPhone")
        .value.trim();

    const address =
        document.getElementById("memberAddress")
        .value.trim();

    const joining =
        document.getElementById("memberJoining")
        .value;

    if(!mill || !name){
        alert("Mill Number and Name are required.");
        return;
    }

    const duplicate =
        members.some(
            m =>
            m.mill.toLowerCase()
            ===
            mill.toLowerCase()
        );

    if(duplicate){
        alert("This Mill Number already exists.");
        return;
    }

    members.push({

        id:
            Date.now(),

        mill,

        name,

        phone,

        address,

        joining:
            joining || today(),

        active:true
    });

    saveData();

    document.getElementById("memberMill").value="";
    document.getElementById("memberName").value="";
    document.getElementById("memberPhone").value="";
    document.getElementById("memberAddress").value="";
    document.getElementById("memberJoining").value="";

    updateAll();

    alert("Member added successfully.");
}

function toggleMemberStatus(id){

    const member =
        getMember(id);

    if(!member)return;

    member.active =
        member.active === false;

    saveData();

    updateAll();
}

function deleteMember(id){

    const member =
        getMember(id);

    if(!member)return;

    if(!confirm(
        "Delete " +
        member.name +
        " (" +
        member.mill +
        ")?"
    )){
        return;
    }

    members =
        members.filter(
            m =>
            Number(m.id)
            !==
            Number(id)
        );

    saveData();

    updateAll();
}

/* =========================================================
   MEAL
========================================================= */

function getMealRecord(memberId,date){

    return meals.find(
        m =>
        Number(m.memberId)
        ===
        Number(memberId)
        &&
        m.date === date
    );
}

function createMealRecord(memberId,date){

    const record={

        id:
            Date.now()+
            Math.random(),

        memberId:
            Number(memberId),

        date,

        breakfast:0,

        lunch:0,

        dinner:0,

        extras:[]
    };

    meals.push(record);

    return record;
}

function nextMealValue(current){

    if(Number(current)===0){
        return 1;
    }

    if(Number(current)===1){
        return .5;
    }

    return 0;
}

function mealSymbol(value){

    if(Number(value)===1){
        return "✓";
    }

    if(Number(value)===.5){
        return "½";
    }

    return "—";
}

function mealClass(value){

    if(Number(value)===1){
        return "full";
    }

    if(Number(value)===.5){
        return "half";
    }

    return "none";
}

function mealText(value){

    if(Number(value)===1){
        return "Full";
    }

    if(Number(value)===.5){
        return "Half";
    }

    return "None";
}

function toggleMeal(memberId,type){

    const date =
        document.getElementById("mealDate").value
        ||
        today();

    let record =
        getMealRecord(
            memberId,
            date
        );

    if(!record){
        record =
            createMealRecord(
                memberId,
                date
            );
    }

    record[type] =
        nextMealValue(
            record[type] || 0
        );

    saveData();

    renderMealCards();
}

/* =========================================================
   EXTRA MEAL
========================================================= */

function addExtraMeal(memberId){

    const date =
        document.getElementById("mealDate").value
        ||
        today();

    const nameInput =
        document.getElementById(
            "extraName_"+memberId
        );

    const qtyInput =
        document.getElementById(
            "extraQty_"+memberId
        );

    if(!nameInput || !qtyInput)return;

    const name =
        nameInput.value.trim();

    const quantity =
        Number(qtyInput.value);

    if(!name){
        alert("Enter extra meal name.");
        return;
    }

    if(!quantity || quantity<=0){
        alert("Enter valid quantity.");
        return;
    }

    let record =
        getMealRecord(
            memberId,
            date
        );

    if(!record){
        record =
            createMealRecord(
                memberId,
                date
            );
    }

    if(!Array.isArray(record.extras)){
        record.extras=[];
    }

    record.extras.push({

        id:
            Date.now()+
            Math.random(),

        name,

        quantity

    });

    saveData();

    renderMealCards();
}

function deleteExtraMeal(
    memberId,
    extraId
){

    const date =
        document.getElementById("mealDate").value
        ||
        today();

    const record =
        getMealRecord(
            memberId,
            date
        );

    if(!record)return;

    record.extras =
        (record.extras || [])
        .filter(
            e =>
            Number(e.id)
            !==
            Number(extraId)
        );

    saveData();

    renderMealCards();
}

function editExtraMeal(
    memberId,
    extraId
){

    const date =
        document.getElementById("mealDate").value
        ||
        today();

    const record =
        getMealRecord(
            memberId,
            date
        );

    if(!record)return;

    const extra =
        (record.extras || [])
        .find(
            e =>
            Number(e.id)
            ===
            Number(extraId)
        );

    if(!extra)return;

    const newName =
        prompt(
            "Extra meal name:",
            extra.name
        );

    if(newName===null)return;

    const newQty =
        prompt(
            "Quantity:",
            extra.quantity
        );

    if(newQty===null)return;

    const quantity =
        Number(newQty);

    if(!newName.trim() || quantity<=0){
        alert("Invalid information.");
        return;
    }

    extra.name =
        newName.trim();

    extra.quantity =
        quantity;

    saveData();

    renderMealCards();
}

/* =========================================================
   EXTRA TOTAL
========================================================= */

function getExtraMealTotal(record){

    if(!record ||
       !Array.isArray(record.extras)){
        return 0;
    }

    return record.extras.reduce(
        (sum,e)=>
            sum+
            Number(e.quantity || 0),
        0
    );
}

/* =========================================================
   RENDER MEALS
========================================================= */

function renderMealCards(){

    const container =
        document.getElementById(
            "mealMembers"
        );

    if(!container)return;

    const date =
        document.getElementById(
            "mealDate"
        ).value
        ||
        today();

    const search =
        (
            document.getElementById(
                "mealSearch"
            )?.value
            ||
            ""
        )
        .toLowerCase()
        .trim();

    const filtered =
        members.filter(
            m =>
            m.name.toLowerCase()
                .includes(search)
            ||
            m.mill.toLowerCase()
                .includes(search)
        );

    container.innerHTML="";

    filtered.forEach(member=>{

        let record =
            getMealRecord(
                member.id,
                date
            );

        if(!record){

            record={
                breakfast:0,
                lunch:0,
                dinner:0,
                extras:[]
            };

        }

        const breakfast =
            Number(record.breakfast||0);

        const lunch =
            Number(record.lunch||0);

        const dinner =
            Number(record.dinner||0);

        const extraTotal =
            getExtraMealTotal(record);

        const normalTotal =
            breakfast+
            lunch+
            dinner;

        const total =
            normalTotal+
            extraTotal;

        const active =
            member.active !== false;

        let extraHTML="";

        if(
            Array.isArray(record.extras)
            &&
            record.extras.length
        ){

            record.extras.forEach(extra=>{

                extraHTML += `

                <div class="extra-item">

                    <div class="extra-left">

                        <span class="extra-name">
                            ${escapeHTML(extra.name)}
                        </span>

                        <span class="extra-qty">
                            Quantity:
                            ${Number(extra.quantity).toFixed(1)}
                        </span>

                    </div>

                    <div class="extra-actions">

                        <button
                            class="btn btn-info btn-small"
                            onclick="
                            editExtraMeal(
                                ${member.id},
                                ${extra.id}
                            )">
                            Edit
                        </button>

                        <button
                            class="btn btn-danger btn-small"
                            onclick="
                            deleteExtraMeal(
                                ${member.id},
                                ${extra.id}
                            )">
                            Delete
                        </button>

                    </div>

                </div>

                `;

            });

        }
        else{

            extraHTML =
                `
                <div style="
                    color:var(--muted);
                    font-size:12px;
                    margin-bottom:8px;
                ">
                    No extra meal added.
                </div>
                `;

        }

        container.innerHTML += `

        <div class="
            meal-member-card
            ${active ? "" : "inactive"}
        ">

            <div class="member-top">

                <div class="member-info">

                    <div class="member-avatar">
                        ${escapeHTML(
                            member.name
                            .charAt(0)
                            .toUpperCase()
                        )}
                    </div>

                    <div>

                        <div class="member-name">
                            ${escapeHTML(member.name)}
                        </div>

                        <div class="member-mill">

                            Mill:
                            <b>
                                ${escapeHTML(member.mill)}
                            </b>

                            ${
                                active
                                ?
                                `
                                <span class="badge badge-green">
                                    ACTIVE
                                </span>
                                `
                                :
                                `
                                <span class="badge badge-gray">
                                    INACTIVE
                                </span>
                                `
                            }

                        </div>

                    </div>

                </div>

                <div class="member-total">

                    <small>Grand Total</small>

                    <strong>
                        ${total.toFixed(1)}
                    </strong>

                </div>

            </div>

            <div class="meal-row">

                <div class="meal-item">

                    <div class="meal-label">
                        🍳 Breakfast
                    </div>

                    <button
                        class="
                            meal-button
                            ${mealClass(breakfast)}
                        "
                        onclick="
                        toggleMeal(
                            ${member.id},
                            'breakfast'
                        )">

                        ${mealSymbol(breakfast)}

                    </button>

                    <span class="meal-state">
                        ${mealText(breakfast)}
                    </span>

                </div>

                <div class="meal-item">

                    <div class="meal-label">
                        🍛 Lunch
                    </div>

                    <button
                        class="
                            meal-button
                            ${mealClass(lunch)}
                        "
                        onclick="
                        toggleMeal(
                            ${member.id},
                            'lunch'
                        )">

                        ${mealSymbol(lunch)}

                    </button>

                    <span class="meal-state">
                        ${mealText(lunch)}
                    </span>

                </div>

                <div class="meal-item">

                    <div class="meal-label">
                        🌙 Dinner
                    </div>

                    <button
                        class="
                            meal-button
                            ${mealClass(dinner)}
                        "
                        onclick="
                        toggleMeal(
                            ${member.id},
                            'dinner'
                        )">

                        ${mealSymbol(dinner)}

                    </button>

                    <span class="meal-state">
                        ${mealText(dinner)}
                    </span>

                </div>

            </div>

            <div class="member-note">

                <span>
                    Normal:
                    <b>${normalTotal.toFixed(1)}</b>
                    |
                    Extra:
                    <b>${extraTotal.toFixed(1)}</b>
                </span>

                <b>
                    Total:
                    ${total.toFixed(1)}
                </b>

            </div>

            <div class="extra-box">

                <div class="extra-title">
                    ➕ Extra Meals
                </div>

                ${extraHTML}

                <div class="extra-add">

                    <input
                        id="extraName_${member.id}"
                        placeholder="Extra meal name">

                    <input
                        id="extraQty_${member.id}"
                        type="number"
                        min="0.1"
                        step="0.5"
                        value="1"
                        placeholder="Qty">

                    <button
                        class="btn btn-primary"
                        onclick="
                        addExtraMeal(
                            ${member.id}
                        )">

                        + Add

                    </button>

                </div>

            </div>

        </div>

        `;

    });

    renderDailySummary();
}

/* =========================================================
   DAILY SUMMARY
========================================================= */

function renderDailySummary(){

    const date =
        document.getElementById(
            "mealDate"
        ).value
        ||
        today();

    let breakfast=0;
    let lunch=0;
    let dinner=0;
    let extra=0;

    members.forEach(member=>{

        const record =
            getMealRecord(
                member.id,
                date
            );

        if(!record)return;

        breakfast +=
            Number(record.breakfast||0);

        lunch +=
            Number(record.lunch||0);

        dinner +=
            Number(record.dinner||0);

        extra +=
            getExtraMealTotal(record);

    });

    const total =
        breakfast+
        lunch+
        dinner+
        extra;

    document.getElementById(
        "dailyMembers"
    ).innerText =
        members.length;

    document.getElementById(
        "dailyBreakfast"
    ).innerText =
        breakfast.toFixed(1);

    document.getElementById(
        "dailyLunch"
    ).innerText =
        lunch.toFixed(1);

    document.getElementById(
        "dailyDinner"
    ).innerText =
        dinner.toFixed(1);

    document.getElementById(
        "dailyTotal"
    ).innerText =
        total.toFixed(1);
}

function loadMealDate(){

    renderMealCards();

}

/* =========================================================
   ALL MEALS
========================================================= */

function setAllMeals(type){

    const date =
        document.getElementById(
            "mealDate"
        ).value
        ||
        today();

    let value=0;

    if(type==="full"){
        value=1;
    }

    if(type==="half"){
        value=.5;
    }

    members.forEach(member=>{

        let record =
            getMealRecord(
                member.id,
                date
            );

        if(!record){
            record =
                createMealRecord(
                    member.id,
                    date
                );
        }

        record.breakfast=value;
        record.lunch=value;
        record.dinner=value;

    });

    saveData();

    renderMealCards();
}

/* =========================================================
   COPY PREVIOUS DAY
========================================================= */

function copyPreviousDay(){

    const currentDate =
        document.getElementById(
            "mealDate"
        ).value
        ||
        today();

    const previous =
        new Date(
            currentDate+
            "T00:00:00"
        );

    previous.setDate(
        previous.getDate()-1
    );

    const previousDate =
        previous
        .toISOString()
        .split("T")[0];

    let copied=0;

    members.forEach(member=>{

        const oldRecord =
            getMealRecord(
                member.id,
                previousDate
            );

        if(!oldRecord)return;

        let currentRecord =
            getMealRecord(
                member.id,
                currentDate
            );

        if(!currentRecord){
            currentRecord =
                createMealRecord(
                    member.id,
                    currentDate
                );
        }

        currentRecord.breakfast =
            oldRecord.breakfast;

        currentRecord.lunch =
            oldRecord.lunch;

        currentRecord.dinner =
            oldRecord.dinner;

        currentRecord.extras =
            JSON.parse(
                JSON.stringify(
                    oldRecord.extras || []
                )
            );

        copied++;

    });

    saveData();

    renderMealCards();

    alert(
        copied+
        " member meal records copied."
    );
}

function saveCurrentDay(){

    saveData();

    renderMealCards();

    alert(
        "Meal data saved for "+
        formatDate(
            document.getElementById(
                "mealDate"
            ).value
        )
    );
}

/* =========================================================
   BAZAR
========================================================= */

function addBazar(){

    const buyer =
        Number(
            document.getElementById(
                "bazarBuyer"
            ).value
        );

    const item =
        document.getElementById(
            "bazarItem"
        ).value.trim();

    const amount =
        Number(
            document.getElementById(
                "bazarAmount"
            ).value
        );

    if(!buyer || !item || amount<=0){

        alert(
            "Complete bazar information."
        );

        return;
    }

    bazars.push({

        id:Date.now(),

        buyer,

        item,

        amount,

        date:todayTime()

    });

    saveData();

    document.getElementById(
        "bazarItem"
    ).value="";

    document.getElementById(
        "bazarAmount"
    ).value="";

    updateAll();
}

function deleteBazar(id){

    if(!confirm("Delete this bazar entry?")){
        return;
    }

    bazars =
        bazars.filter(
            b =>
            Number(b.id)
            !==
            Number(id)
        );

    saveData();

    updateAll();
}

/* =========================================================
   EXPENSE
========================================================= */

function addExpense(){

    const name =
        document.getElementById(
            "expenseName"
        ).value.trim();

    const amount =
        Number(
            document.getElementById(
                "expenseAmount"
            ).value
        );

    if(!name || amount<=0){

        alert(
            "Complete expense information."
        );

        return;
    }

    expenses.push({

        id:Date.now(),

        name,

        amount,

        date:todayTime()

    });

    saveData();

    document.getElementById(
        "expenseName"
    ).value="";

    document.getElementById(
        "expenseAmount"
    ).value="";

    updateAll();
}

function deleteExpense(id){

    if(!confirm("Delete this expense?")){
        return;
    }

    expenses =
        expenses.filter(
            e =>
            Number(e.id)
            !==
            Number(id)
        );

    saveData();

    updateAll();
}

/* =========================================================
   DEPOSIT
========================================================= */

function addDeposit(){

    const memberId =
        Number(
            document.getElementById(
                "depositMember"
            ).value
        );

    const amount =
        Number(
            document.getElementById(
                "depositAmount"
            ).value
        );

    const note =
        document.getElementById(
            "depositNote"
        ).value.trim();

    if(!memberId || amount<=0){

        alert(
            "Select member and enter amount."
        );

        return;
    }

    deposits.push({

        id:Date.now(),

        memberId,

        amount,

        note:
            note ||
            "Payment",

        date:todayTime()

    });

    saveData();

    document.getElementById(
        "depositAmount"
    ).value="";

    document.getElementById(
        "depositNote"
    ).value="";

    updateAll();

    alert("Joma added successfully.");
}

function deleteDeposit(id){

    if(!confirm("Delete this payment?")){
        return;
    }

    deposits =
        deposits.filter(
            d =>
            Number(d.id)
            !==
            Number(id)
        );

    saveData();

    updateAll();
}

/* =========================================================
   HELPERS
========================================================= */

function getMember(id){

    return members.find(
        m =>
        Number(m.id)
        ===
        Number(id)
    );
}

function getActiveMembers(){

    return members.filter(
        m =>
        m.active !== false
    );
}

function totalActiveMembers(){

    return getActiveMembers().length;
}

function getMemberMeals(id){

    return meals
        .filter(
            m =>
            Number(m.memberId)
            ===
            Number(id)
        )
        .reduce(
            (sum,m)=>{

                const normal =
                    Number(m.breakfast||0)
                    +
                    Number(m.lunch||0)
                    +
                    Number(m.dinner||0);

                const extra =
                    getExtraMealTotal(m);

                return sum+
                    normal+
                    extra;

            },
            0
        );
}

function getMemberDeposit(id){

    return deposits
        .filter(
            d =>
            Number(d.memberId)
            ===
            Number(id)
        )
        .reduce(
            (sum,d)=>
                sum+
                Number(d.amount||0),
            0
        );
}

function totalMeals(){

    return meals.reduce(
        (sum,m)=>{

            const normal =
                Number(m.breakfast||0)
                +
                Number(m.lunch||0)
                +
                Number(m.dinner||0);

            const extra =
                getExtraMealTotal(m);

            return sum+
                normal+
                extra;

        },
        0
    );
}

function totalBazar(){

    return bazars.reduce(
        (sum,b)=>
            sum+
            Number(b.amount||0),
        0
    );
}

function totalExpenses(){

    return expenses.reduce(
        (sum,e)=>
            sum+
            Number(e.amount||0),
        0
    );
}

function totalDeposit(){

    return deposits.reduce(
        (sum,d)=>
            sum+
            Number(d.amount||0),
        0
    );
}

/* =========================================================
   FINANCIAL CALCULATION
========================================================= */

function getMemberExtraExpense(id){

    const activeCount =
        totalActiveMembers();

    if(activeCount<=0){
        return 0;
    }

    const totalExpense =
        totalExpenses();

    const member =
        getMember(id);

    if(!member){
        return 0;
    }

    if(member.active===false){
        return 0;
    }

    return totalExpense /
        activeCount;
}

function getFinancialData(id){

    const member =
        getMember(id);

    const memberMeals =
        getMemberMeals(id);

    const deposit =
        getMemberDeposit(id);

    const allMeals =
        totalMeals();

    const bazar =
        totalBazar();

    const mealRate =
        allMeals>0
        ?
        bazar/allMeals
        :
        0;

    const mealCost =
        memberMeals*
        mealRate;

    const otherExpense =
        getMemberExtraExpense(id);

    const finalBill =
        mealCost+
        otherExpense;

    const balance =
        deposit-
        finalBill;

    const refund =
        balance>0
        ?
        balance
        :
        0;

    const due =
        balance<0
        ?
        Math.abs(balance)
        :
        0;

    let status="CLEAR";

    if(refund>0){
        status="REFUND";
    }

    if(due>0){
        status="DUE";
    }

    return{

        meals:memberMeals,

        deposit,

        rate:mealRate,

        mealCost,

        otherExpense,

        finalBill,

        refund,

        due,

        status
    };
}

/* =========================================================
   SELECTS
========================================================= */

function renderSelects(){

    const ids=[
        "bazarBuyer",
        "depositMember"
    ];

    ids.forEach(id=>{

        const select =
            document.getElementById(id);

        if(!select)return;

        const current =
            select.value;

        const first =
            id==="bazarBuyer"
            ?
            "Select Buyer"
            :
            "Select Member";

        select.innerHTML =
            `
            <option value="">
                ${first}
            </option>
            `;

        members.forEach(member=>{

            select.innerHTML +=

            `
            <option value="${member.id}">
                ${escapeHTML(member.mill)}
                -
                ${escapeHTML(member.name)}
                ${
                    member.active===false
                    ?
                    " (Inactive)"
                    :
                    ""
                }
            </option>
            `;

        });

        select.value=current;

    });
}

/* =========================================================
   MEMBER TABLE
========================================================= */

function renderMembers(){

    const table =
        document.getElementById(
            "memberTable"
        );

    const search =
        (
            document.getElementById(
                "memberSearch"
            )?.value
            ||
            ""
        )
        .toLowerCase()
        .trim();

    table.innerHTML="";

    const filtered =
        members.filter(
            m =>
            m.name.toLowerCase()
                .includes(search)
            ||
            m.mill.toLowerCase()
                .includes(search)
            ||
            (m.phone||"")
                .toLowerCase()
                .includes(search)
        );

    filtered.forEach(m=>{

        const f =
            getFinancialData(m.id);

        const active =
            m.active!==false;

        table.innerHTML += `

        <tr>

            <td>
                <b>${escapeHTML(m.mill)}</b>
            </td>

            <td>
                ${escapeHTML(m.name)}
            </td>

            <td>
                ${escapeHTML(m.phone||"-")}
            </td>

            <td>

                ${
                    active
                    ?
                    `
                    <span class="badge badge-green">
                        ACTIVE
                    </span>
                    `
                    :
                    `
                    <span class="badge badge-gray">
                        INACTIVE
                    </span>
                    `
                }

            </td>

            <td>
                ${f.meals.toFixed(1)}
            </td>

            <td>
                ৳ ${money(f.deposit)}
            </td>

            <td>
                ৳ ${money(f.finalBill)}
            </td>

            <td>
                ${statusBadge(f.status)}
            </td>

            <td>

                <button
                    class="btn btn-info btn-small"
                    onclick="
                    openMember(${m.id})
                    ">
                    View
                </button>

                <button
                    class="btn btn-warning btn-small"
                    onclick="
                    toggleMemberStatus(${m.id})
                    ">
                    ${
                        active
                        ?
                        "Deactivate"
                        :
                        "Activate"
                    }
                </button>

                <button
                    class="btn btn-danger btn-small"
                    onclick="
                    deleteMember(${m.id})
                    ">
                    Delete
                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById(
        "memberCount"
    ).innerText =
        filtered.length+
        " / "+
        members.length+
        " Members";
}

/* =========================================================
   BAZAR TABLE
========================================================= */

function renderBazars(){

    const table =
        document.getElementById(
            "bazarTable"
        );

    table.innerHTML="";

    bazars
        .slice()
        .reverse()
        .forEach(b=>{

            const member =
                getMember(b.buyer);

            table.innerHTML += `

            <tr>

                <td>
                    ${
                        member
                        ?
                        escapeHTML(member.mill)
                        :
                        "-"
                    }
                </td>

                <td>
                    ${
                        member
                        ?
                        escapeHTML(member.name)
                        :
                        "Unknown"
                    }
                </td>

                <td>
                    ${escapeHTML(b.item)}
                </td>

                <td>
                    ৳ ${money(b.amount)}
                </td>

                <td>
                    ${formatDate(b.date)}
                </td>

                <td>

                    <button
                        class="btn btn-danger btn-small"
                        onclick="
                        deleteBazar(${b.id})
                        ">
                        Delete
                    </button>

                </td>

            </tr>

            `;

        });
}

/* =========================================================
   EXPENSE TABLE
========================================================= */

function renderExpenses(){

    const table =
        document.getElementById(
            "expenseTable"
        );

    table.innerHTML="";

    expenses
        .slice()
        .reverse()
        .forEach(e=>{

            table.innerHTML += `

            <tr>

                <td>
                    ${escapeHTML(e.name)}
                </td>

                <td>
                    ৳ ${money(e.amount)}
                </td>

                <td>
                    ${formatDate(e.date)}
                </td>

                <td>

                    <button
                        class="btn btn-danger btn-small"
                        onclick="
                        deleteExpense(${e.id})
                        ">
                        Delete
                    </button>

                </td>

            </tr>

            `;

        });
}

/* =========================================================
   DEPOSIT TABLE
========================================================= */

function renderDeposits(){

    const table =
        document.getElementById(
            "depositTable"
        );

    table.innerHTML="";

    deposits
        .slice()
        .reverse()
        .forEach(d=>{

            const member =
                getMember(d.memberId);

            if(!member)return;

            table.innerHTML += `

            <tr>

                <td>
                    ${escapeHTML(member.mill)}
                </td>

                <td>
                    ${escapeHTML(member.name)}
                </td>

                <td>
                    <b>
                        ৳ ${money(d.amount)}
                    </b>
                </td>

                <td>
                    ${escapeHTML(d.note)}
                </td>

                <td>
                    ${formatDate(d.date)}
                </td>

                <td>

                    <button
                        class="btn btn-danger btn-small"
                        onclick="
                        deleteDeposit(${d.id})
                        ">
                        Delete
                    </button>

                </td>

            </tr>

            `;

        });
}

/* =========================================================
   CALCULATION
========================================================= */

function renderCalculation(){

    const allMeals =
        totalMeals();

    const bazar =
        totalBazar();

    const expense =
        totalExpenses();

    const activeMembers =
        totalActiveMembers();

    const rate =
        allMeals>0
        ?
        bazar/allMeals
        :
        0;

    const expensePerMember =
        activeMembers>0
        ?
        expense/activeMembers
        :
        0;

    document.getElementById(
        "calcMeals"
    ).innerText =
        allMeals.toFixed(1);

    document.getElementById(
        "calcBazar"
    ).innerText =
        money(bazar);

    document.getElementById(
        "calcExpense"
    ).innerText =
        money(expense);

    document.getElementById(
        "calcActiveMembers"
    ).innerText =
        activeMembers;

    document.getElementById(
        "calcExpensePerMember"
    ).innerText =
        money(expensePerMember);

    const table =
        document.getElementById(
            "calculationTable"
        );

    table.innerHTML="";

    members.forEach(m=>{

        const f =
            getFinancialData(m.id);

        table.innerHTML += `

        <tr>

            <td>
                <b>
                    ${escapeHTML(m.mill)}
                </b>
            </td>

            <td>
                ${escapeHTML(m.name)}
            </td>

            <td>
                ${f.meals.toFixed(1)}
            </td>

            <td>
                ৳ ${money(f.mealCost)}
            </td>

            <td>
                ${
                    m.active!==false
                    ?
                    "৳ "+money(f.otherExpense)
                    :
                    "—"
                }
            </td>

            <td>
                ৳ ${money(f.deposit)}
            </td>

            <td>
                ৳ ${money(f.finalBill)}
            </td>

            <td>
                ${
                    f.refund>0
                    ?
                    "৳ "+money(f.refund)
                    :
                    "—"
                }
            </td>

            <td>
                ${
                    f.due>0
                    ?
                    "৳ "+money(f.due)
                    :
                    "—"
                }
            </td>

            <td>
                ${statusBadge(f.status)}
            </td>

            <td>

                <button
                    class="btn btn-info btn-small"
                    onclick="
                    openMember(${m.id})
                    ">
                    Details
                </button>

            </td>

        </tr>

        `;

    });
}

/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard(){

    const allMeals =
        totalMeals();

    const bazar =
        totalBazar();

    const expense =
        totalExpenses();

    const deposit =
        totalDeposit();

    const activeMembers =
        totalActiveMembers();

    const rate =
        allMeals>0
        ?
        bazar/allMeals
        :
        0;

    const expensePerMember =
        activeMembers>0
        ?
        expense/activeMembers
        :
        0;

    let due=0;
    let refund=0;

    members.forEach(m=>{

        const f =
            getFinancialData(m.id);

        due+=f.due;
        refund+=f.refund;

    });

    document.getElementById(
        "totalMembers"
    ).innerText =
        members.length;

    document.getElementById(
        "totalMealsDashboard"
    ).innerText =
        allMeals.toFixed(1);

    document.getElementById(
        "totalDeposit"
    ).innerText =
        money(deposit);

    document.getElementById(
        "totalCost"
    ).innerText =
        money(bazar+expense);

    document.getElementById(
        "dashboardRate"
    ).innerText =
        money(rate);

    document.getElementById(
        "dashboardDue"
    ).innerText =
        money(due);

    document.getElementById(
        "dashboardRefund"
    ).innerText =
        money(refund);

    document.getElementById(
        "dashboardExpensePerMember"
    ).innerText =
        money(expensePerMember);

    document.getElementById(
        "summaryActiveMembers"
    ).innerText =
        activeMembers;

    document.getElementById(
        "summaryMeals"
    ).innerText =
        allMeals.toFixed(1);

    document.getElementById(
        "summaryDeposit"
    ).innerText =
        money(deposit);

    document.getElementById(
        "summaryBazar"
    ).innerText =
        money(bazar);

    document.getElementById(
        "summaryExpense"
    ).innerText =
        money(expense);

    document.getElementById(
        "summaryRate"
    ).innerText =
        money(rate);

    const table =
        document.getElementById(
            "dashboardMembers"
        );

    table.innerHTML="";

    members.slice(0,10)
        .forEach(m=>{

            const f =
                getFinancialData(m.id);

            table.innerHTML += `

            <tr>

                <td>
                    <b>${escapeHTML(m.mill)}</b>
                </td>

                <td>
                    ${escapeHTML(m.name)}
                </td>

                <td>
                    ${f.meals.toFixed(1)}
                </td>

                <td>
                    ৳ ${money(f.deposit)}
                </td>

                <td>
                    ${
                        m.active!==false
                        ?
                        "৳ "+money(f.otherExpense)
                        :
                        "—"
                    }
                </td>

                <td>
                    ৳ ${money(f.finalBill)}
                </td>

                <td>
                    ${statusBadge(f.status)}
                </td>

            </tr>

            `;

        });
}

/* =========================================================
   REPORT
========================================================= */

function renderReports(){

    document.getElementById(
        "reportMembers"
    ).innerText =
        members.length;

    document.getElementById(
        "reportMeals"
    ).innerText =
        totalMeals().toFixed(1);

    document.getElementById(
        "reportDeposit"
    ).innerText =
        money(totalDeposit());

    document.getElementById(
        "reportCost"
    ).innerText =
        money(
            totalBazar()+
            totalExpenses()
        );

    const table =
        document.getElementById(
            "reportTable"
        );

    table.innerHTML="";

    members.forEach(m=>{

        const f =
            getFinancialData(m.id);

        table.innerHTML += `

        <tr>

            <td>
                ${escapeHTML(m.mill)}
            </td>

            <td>
                ${escapeHTML(m.name)}
            </td>

            <td>
                ${f.meals.toFixed(1)}
            </td>

            <td>
                ৳ ${money(f.mealCost)}
            </td>

            <td>
                ${
                    m.active!==false
                    ?
                    "৳ "+money(f.otherExpense)
                    :
                    "—"
                }
            </td>

            <td>
                ৳ ${money(f.deposit)}
            </td>

            <td>
                ${
                    f.refund>0
                    ?
                    "৳ "+money(f.refund)
                    :
                    "—"
                }
            </td>

            <td>
                ${
                    f.due>0
                    ?
                    "৳ "+money(f.due)
                    :
                    "—"
                }
            </td>

            <td>
                ${statusBadge(f.status)}
            </td>

        </tr>

        `;

    });
}

/* =========================================================
   MEMBER PROFILE
========================================================= */

function openMember(id){

    const member =
        getMember(id);

    if(!member)return;

    const f =
        getFinancialData(id);

    const profile =
        document.getElementById(
            "memberProfile"
        );

    profile.innerHTML = `

    <div class="profile">

        <div class="profile-header">

            <div class="profile-avatar">

                ${escapeHTML(
                    member.name
                        .charAt(0)
                        .toUpperCase()
                )}

            </div>

            <div>

                <h2>
                    ${escapeHTML(member.name)}
                </h2>

                <p style="color:var(--muted)">

                    Mill:
                    <b>
                        ${escapeHTML(member.mill)}
                    </b>

                </p>

                <div style="margin-top:5px">

                    ${
                        member.active!==false
                        ?
                        `
                        <span class="badge badge-green">
                            ACTIVE MEMBER
                        </span>
                        `
                        :
                        `
                        <span class="badge badge-gray">
                            INACTIVE MEMBER
                        </span>
                        `
                    }

                </div>

            </div>

        </div>

        <div class="profile-grid">

            <div class="profile-item">
                <small>Mill Number</small>
                <strong>
                    ${escapeHTML(member.mill)}
                </strong>
            </div>

            <div class="profile-item">
                <small>Phone</small>
                <strong>
                    ${escapeHTML(member.phone||"-")}
                </strong>
            </div>

            <div class="profile-item">
                <small>Joining Date</small>
                <strong>
                    ${member.joining||"-"}
                </strong>
            </div>

            <div class="profile-item">
                <small>Total Meals</small>
                <strong>
                    ${f.meals.toFixed(1)}
                </strong>
            </div>

            <div class="profile-item">
                <small>Meal Rate</small>
                <strong>
                    ৳ ${money(f.rate)}
                </strong>
            </div>

            <div class="profile-item">
                <small>Meal Cost</small>
                <strong>
                    ৳ ${money(f.mealCost)}
                </strong>
            </div>

            <div class="profile-item">
                <small>Other Expense Share</small>
                <strong>
                    ${
                        member.active!==false
                        ?
                        "৳ "+money(f.otherExpense)
                        :
                        "৳ 0.00"
                    }
                </strong>
            </div>

            <div class="profile-item">
                <small>Total Joma</small>
                <strong>
                    ৳ ${money(f.deposit)}
                </strong>
            </div>

            <div class="profile-item">
                <small>Final Bill</small>
                <strong>
                    ৳ ${money(f.finalBill)}
                </strong>
            </div>

            <div class="profile-item">
                <small>Address</small>
                <strong>
                    ${escapeHTML(member.address||"-")}
                </strong>
            </div>

        </div>

        <div class="balance-box">

            <div class="balance-card">

                <h3>Joma</h3>

                <div class="balance-number">
                    ৳ ${money(f.deposit)}
                </div>

            </div>

            <div class="balance-card">

                <h3>Final Bill</h3>

                <div class="balance-number">
                    ৳ ${money(f.finalBill)}
                </div>

            </div>

            <div class="balance-card">

                <h3>Refund</h3>

                <div
                    class="balance-number"
                    style="color:var(--success)">

                    ৳ ${money(f.refund)}

                </div>

            </div>

            <div class="balance-card">

                <h3>Due</h3>

                <div
                    class="balance-number"
                    style="color:var(--danger)">

                    ৳ ${money(f.due)}

                </div>

            </div>

        </div>

        <div style="
            margin-top:20px;
            padding:20px;
            border-radius:12px;
            background:var(--bg);
            text-align:center;
        ">

            <h3>Final Status</h3>

            <div style="margin-top:10px">
                ${statusBadge(f.status)}
            </div>

        </div>

    </div>

    `;

    document.getElementById(
        "memberModal"
    ).classList.add("show");
}

function closeModal(){

    document.getElementById(
        "memberModal"
    ).classList.remove("show");
}

/* =========================================================
   STATUS
========================================================= */

function statusBadge(status){

    if(status==="REFUND"){

        return `
        <span class="badge badge-green">
            💰 REFUND
        </span>
        `;

    }

    if(status==="DUE"){

        return `
        <span class="badge badge-red">
            ⚠️ DUE
        </span>
        `;

    }

    return `
    <span class="badge badge-blue">
        ✓ CLEAR
    </span>
    `;
}

/* =========================================================
   STORAGE
========================================================= */

function saveData(){

    localStorage.setItem(
        "mess_members_v4",
        JSON.stringify(members)
    );

    localStorage.setItem(
        "mess_meals_v4",
        JSON.stringify(meals)
    );

    localStorage.setItem(
        "mess_bazars_v4",
        JSON.stringify(bazars)
    );

    localStorage.setItem(
        "mess_expenses_v4",
        JSON.stringify(expenses)
    );

    localStorage.setItem(
        "mess_deposits_v4",
        JSON.stringify(deposits)
    );
}

/* =========================================================
   DARK MODE
========================================================= */

let darkMode =
    localStorage.getItem(
        "mess_dark_v4"
    ) === "true";

function applyDarkMode(){

    if(darkMode){

        document.documentElement
            .style.setProperty(
                "--bg",
                "#111827"
            );

        document.documentElement
            .style.setProperty(
                "--card",
                "#1f2937"
            );

        document.documentElement
            .style.setProperty(
                "--text",
                "#f9fafb"
            );

        document.documentElement
            .style.setProperty(
                "--muted",
                "#9ca3af"
            );

        document.documentElement
            .style.setProperty(
                "--border",
                "#374151"
            );

    }
    else{

        document.documentElement
            .style.setProperty(
                "--bg",
                "#f4f6fb"
            );

        document.documentElement
            .style.setProperty(
                "--card",
                "#ffffff"
            );

        document.documentElement
            .style.setProperty(
                "--text",
                "#111827"
            );

        document.documentElement
            .style.setProperty(
                "--muted",
                "#6b7280"
            );

        document.documentElement
            .style.setProperty(
                "--border",
                "#e5e7eb"
            );

    }
}

function toggleDark(){

    darkMode=!darkMode;

    localStorage.setItem(
        "mess_dark_v4",
        darkMode
    );

    applyDarkMode();
}

/* =========================================================
   UTILITIES
========================================================= */

function money(value){

    return Number(
        value||0
    ).toFixed(2);
}

function today(){

    const d =
        new Date();

    const year =
        d.getFullYear();

    const month =
        String(
            d.getMonth()+1
        ).padStart(2,"0");

    const day =
        String(
            d.getDate()
        ).padStart(2,"0");

    return (
        year+
        "-"+
        month+
        "-"+
        day
    );
}

function todayTime(){

    return new Date().toISOString();
}

function formatDate(value){

    if(!value){
        return "-";
    }

    const d =
        new Date(value);

    if(isNaN(d.getTime())){
        return value;
    }

    return d.toLocaleDateString(
        "en-GB",
        {
            day:"2-digit",
            month:"short",
            year:"numeric"
        }
    );
}

function escapeHTML(value){

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(
            value ?? ""
        );

    return div.innerHTML;
}

/* =========================================================
   UPDATE ALL
========================================================= */

function updateAll(){

    renderSelects();

    renderMembers();

    renderBazars();

    renderExpenses();

    renderDeposits();

    renderCalculation();

    renderDashboard();

    renderReports();

    renderDailySummary();
}

/* =========================================================
   INIT
========================================================= */

document.getElementById(
    "mealDate"
).value =
today();

applyDarkMode();

updateAll();

renderMealCards();
/* =========================================================
   RESET ALL DATA
========================================================= */

function resetAllData(){

    const firstConfirm = confirm(
        "⚠️ WARNING!\n\n" +
        "This will permanently delete ALL data:\n\n" +
        "👥 Members\n" +
        "🍚 Meals\n" +
        "🛒 Bazar\n" +
        "💰 Expenses\n" +
        "💵 Joma / Payments\n\n" +
        "Are you sure you want to continue?"
    );

    if(!firstConfirm){
        return;
    }

    const secondConfirm = confirm(
        "🚨 FINAL CONFIRMATION!\n\n" +
        "All Mess Manager data will be permanently deleted.\n\n" +
        "Press OK to DELETE EVERYTHING."
    );

    if(!secondConfirm){
        return;
    }

    // Clear application data
    localStorage.removeItem("mess_members_v4");
    localStorage.removeItem("mess_meals_v4");
    localStorage.removeItem("mess_bazars_v4");
    localStorage.removeItem("mess_expenses_v4");
    localStorage.removeItem("mess_deposits_v4");

    // Keep dark mode setting
    // localStorage.removeItem("mess_dark_v4");

    alert(
        "✅ All Mess Manager data has been reset successfully!"
    );

    // Reload application
    location.reload();
}
