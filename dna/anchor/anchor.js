function genesis() {
  return true;
}

function bridgeGenesis()
{
  return true;
}

//USED IN GENESIS TO AN THE INITIAL ANCHOR

function getMainAchorHash()
{
  var anchorMain = {Anchor_Type:"Anchor_Type",Anchor_Text:""};
  var hashAnchorMain = makeHash("anchor",anchorMain);
  return hashAnchorMain;
}

function getAnchorTypeHash(anchor_type)
{
  var anchorType = {Anchor_Type:anchor_type,Anchor_Text:""};
  var anchorTypeHash = makeHash("anchor",anchorType);
  return anchorTypeHash;
}
function addAnchor()
{
  var dna = App.DNA.Hash;
  var anchor_main = {Anchor_Type:"Anchor_Type",Anchor_Text:""};
  var anchor_main_hash=commit("anchor",anchor_main);
  commit("anchor_links", {Links:[{Base:dna,Link:anchor_main_hash,Tag:"Anchor"}]});
  var lnk = getLinks(dna,"Anchor",{Load : true});
  //var lnk = get(anchor_main_hash);
  debug("Main anchor hash on link - "+lnk[0]["Hash"]);

  //return lnk.Links[0].H;
  return lnk[0]["Hash"];
}

//USED TO CREATE A NEW Anchor_Type
function anchor_type_create(anchor_type)
{
  var anchor_main_hash=getMainAchorHash();
  var new_anchorType= {Anchor_Type:anchor_type,Anchor_Text:""};

  var key=commit("anchor",new_anchorType);
  debug("Anchor type "+anchor_type+" created with hash : "+key);
  commit("anchor_links",{Links:[{Base:anchor_main_hash,Link:key,Tag:"Anchor_Type"}]});
  var anctyplnk= getLinks(anchor_main_hash,"Anchor_Type",{Load:true});

  return anctyplnk[0]["Hash"];
}

function anchor_create(new_anchor)
{
  var new_anchorHash=commit("anchor",new_anchor);
  debug("Creating anchor with text : "+new_anchor.Anchor_Text+" and type : "+new_anchor.Anchor_Type);
  var anchorTypeHash = getAnchorTypeHash(new_anchor.Anchor_Type);
  debug("Got anchor type hash : "+anchorTypeHash);

  //var lnk1 = commit("anchor_links",{Links:[{Base:anchorTypeHash,Link:new_anchorHash,Tag:"Anchor_Text"}]});
  anchor_link(anchorTypeHash,new_anchorHash);

  //var lnk = getLink(anchorTypeHash,"Anchor_Text",{Load:true});
  var lnk = getAnchorsList(anchorTypeHash,"Anchor_Text");
  debug("Anchor created : ");
  debug(lnk);
  return lnk;
}

function anchor_link(anchor_type,anchor_text)
{
  commit("anchor_links",{Links:[{Base:anchor_type,Link:anchor_text,Tag:"Anchor_Text"}]});
}

function anchor_update(updateText)
{
  var anchor_type = updateText.anchor_type;
  var old_anchorText = updateText.old_anchorText;
  var new_anchorText = updateText.new_anchorText;

  var oldAnchor={Anchor_Type:anchor_type,Anchor_Text:old_anchorText};
  var oldAnchorHash = makeHash("anchor",oldAnchor);

  var newAnchor={Anchor_Type:anchor_type,Anchor_Text:new_anchorText};
  var newAnchorHash = makeHash("anchor",newAnchor);

  var anchorTypeHash = getAnchorTypeHash(anchor_type);

  var updatedAnchor = update("anchor",newAnchor,oldAnchorHash);
  debug("Old text : "+updateText.old_anchorText+" Old hash : "+oldAnchorHash);
  debug("New text : "+updateText.new_anchorText+" New hash : "+newAnchorHash);
  debug("Anchor text successfully updated ! New anchor hash : "+updatedAnchor);

  anchor_updatelink(anchorTypeHash,oldAnchorHash,newAnchorHash);

  var updcheck = getLinks(anchorTypeHash,"Anchor_Text",{Load:true});
  return updcheck;
}

function anchor_updatelink(anchorTypeHash,oldAnchorHash,newAnchorHash)
{
  commit("anchor_links",
         {Links:[
             {Base:anchorTypeHash,Link:oldAnchorHash,Tag:"Anchor_Text",LinkAction:HC.LinkAction.Del},
             {Base:anchorTypeHash,Link:newAnchorHash,Tag:"Anchor_Text"}
         ]});
}

// List all the anchor types linked to from "AnchorType" created in genesis
function anchor_type_list()
{
  var anchor_type_list=[];
  anchor_main_hash=getMainAchorHash();
  var anchor_type_list=getAnchorTypeList(anchor_main_hash,"Anchor_Type");

  /*for(var j=0;j<anchor_type.length;j++)
  {
    var temp = anchor_type[j].Anchor_Type;
    debug(temp);
    var parsed = JSON.parse(temp);
    debug(parsed.Anchor_Type);
    anchor_type_list.push(parsed.Anchor_Type);
  }*/

  return anchor_type_list;
}

function anchor_list(anchorType)
{

  anchor_type_hash=getAnchorTypeHash(anchorType);
  debug("Anchor type hash :"+anchor_type_hash);


  var anchorList=getAnchorsList(anchor_type_hash,"Anchor_Text");


  var ser = JSON.stringify(anchorList);


  return ser;
}
/*****
*****/
// helper function to do getLinks call and return a list of anchors, handle the no-link error case, and copy the returned entry values into a nicer array
function getAnchorsList(base, tag) {
    // get the tag from the base in the DHT

    var links = getLinks(base,tag,{Load:true});
      //debug("Links : ");
      //debug(links);
    if (isErr(links)) {
        links = [];
    }
    /*else {
        links = links.Links;
    }*/
    var links_filled = [];
    for (var i=0;i <links.length;i++) {
        var link = links[i]["Entry"]["Anchor_Text"];
        //link[tag] = links[i]["Entry"];
        links_filled.push(link);
    }
    debug("Links Filled:"+JSON.stringify(links_filled));
    return links_filled;
}
// helper function to do getLink call and return a list of anchor types, handle the no-link error case, and copy the returned entry values into a nicer array
function getAnchorTypeList(base, tag) {
    // get the tag from the base in the DHT

    var links = getLinks(base,tag,{Load:true});
      //debug("Links : ");
      //debug(links);
    if (isErr(links)) {
        links = [];
    }
    /*else {
        links = links.Links;
    }*/
    var links_filled = [];
    for (var i=0;i <links.length;i++) {
        var link = links[i]["Entry"]["Anchor_Type"];
        //link[tag] = links[i]["Entry"];
        links_filled.push(link);
    }
    debug("Links Filled for anchor type:"+JSON.stringify(links_filled));
    return links_filled;
}


// helper function to determine if value returned from holochain function is an error
function isErr(result) {
    return ((typeof result === 'object') && result.name == "HolochainError");
}
function validatePut(entry_type,entry,header,pkg,sources) {
    return validate(entry_type,entry,header,sources);
}
function validateCommit(entry_type,entry,header,pkg,sources) {
    return validate(entry_type,entry,header,sources);
}
// Local validate an entry before committing ???
function validate(entry_type,entry,header,sources) {
//debug("entry_type::"+entry_type+"entry"+entry+"header"+header+"sources"+sources);
    if (entry_type == "anchor_links"||entry_type == "anchor") {
      return true;
    }
    return true
}

function validateLink(linkingEntryType,baseHash,linkHash,tag,pkg,sources){
    // this can only be "room_message_link" type which is linking from room to message
//debug("LinkingEntry_type:"+linkingEntryType+" baseHash:"+baseHash+" linkHash:"+linkHash+" tag:"+tag+" pkg:"+pkg+" sources:"+sources);
if(linkingEntryType=="anchor_links")
return true;


return true;
}
function validateMod(entry_type,hash,newHash,pkg,sources) {return false;}
function validateDel(entry_type,hash,pkg,sources) {return false;}
function validatePutPkg(entry_type) {return null}
function validateModPkg(entry_type) { return null}
function validateDelPkg(entry_type) { return null}
function validateLinkPkg(entry_type) { return null}
