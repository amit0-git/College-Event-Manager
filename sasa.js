    //function to add PID in the table 
    async function addData() {

        await showLoading();
  
  
  
        try {
  
          //clear the previous TID exists data
          await clearGenerateHTMLForTID()
  
  
  
  
          let pid = document.getElementById("pidinp").value.toUpperCase()
          const pidArrayCheck = await pids.includes(pid)
  
  
           //fetch details of the PID
           const data = await fetchData(pid)
  
          if (pidArrayCheck) {
            //if we are trying to add same PID
            console.log("pid array check:", pidArrayCheck)
            console.log("pids:", pids)
            await hideLoading()
            return error.innerHTML = "PID already added!"
  
          }
          
          else if (!eventMax) {
            console.log("Evnt mx:", eventMax)
            //check whether event is selected
            await hideLoading()
            return error.innerHTML = "Please Select Event!"
          }
          
          else if (!pid) {
            //if the pid input is empty
            await hideLoading()
            return error.innerHTML = "Please Enter PID!"
          }
  
          //check whether you are not adding same pid to team event
  
  
  
          //check whether the team limit exceeded
          else if (await pids.length >= await eventMax['data']) {
            await hideLoading()
            return error.innerHTML = "Event Limit Exceeded!"
          }
          
            
          else if (data['student'] === "Not Found") {
            //if the server return not found
            await hideLoading()
            return error.innerHTML = "NO PID Found!"
          }
  
  
  
        
  
       
  
          // if (data['student'] === "Not Found") {
          //   //if the server return not found
          //   await hideLoading()
          //   return error.innerHTML = "NO PID Found!"
          // } 
          
          else {
            //if the pid is found
  
  
            //new logic 
  
            const pidExists = await isPIDregisteredWithSameEvent(pid);
  
            if (pidExists['status']) {
              //if the PID is registered with same event
  
              error.innerHTML = "PID already In the team!"
              console.log("pid exists", pidExists['data'])
              await generateHTMLForTID(pidExists['data'], null)
  
            } else {
              //if the PID is not registered same event
  
              //check the roles of student for participation
              const studentRoleVerify = await checkParticipationCondition(pid);
  
              console.log("role verify", studentRoleVerify)
  
              if (studentRoleVerify['status']) {
                //if the role is verified and user is allowed to participate
  
                await pids.push(pid)
                //wait for the pid to enter in the database
                await createHTML(data)
  
  
              } else {
                //if the role is not verified and PID not registered with the  event
                console.log(pidExists['data'])
  
  
                error.innerHTML = studentRoleVerify['data']
              }
  
  
            }
            await hideLoading()
  
  
  
          }
        } catch (error) {
          await hideLoading()
          console.log("Add Data Error: ", error)
        }
  
        // //check the roles of student for participation
        // const studentRoleVerify = await checkParticipationCondition(pid);
  
        // console.log("verify", studentRoleVerify)
  
        // if (studentRoleVerify['status']) {
  
        //   const data1 = await isPIDregisteredWithSameEvent(pid);
        //   if (data1) {
        //     error.innerHTML = "PID already In the team!"
        //     console.log(data1['data'])
        //     await generateHTMLForTID(data1['data'], null)
        //   } else {
        //     await createHTML(data)
        //     pids.push(pid)
        //   }
  
        // } else {
        //   const data1 = await isPIDregisteredWithSameEvent(pid);
        //   console.log("data1 after role", data1)
        //   if (data1) {
        //     await generateHTMLForTID(data1['data'], null)
        //   }
  
        //   error.innerHTML = studentRoleVerify['data']
        // }
  
  
  
  
      }
  