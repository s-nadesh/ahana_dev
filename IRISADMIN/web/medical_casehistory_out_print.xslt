<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html" encoding="UTF-8"/>
    <xsl:template match="/">
        <xsl:for-each select="FIELDS/GROUP">
            <table id="heading" width="100%" border="0" cellspacing="0" cellpadding="0">
                
                <tbody>
                    <!-- 1st row -->
                    <xsl:for-each select="PANELHEADER">
                        <tr>
                            <td colspan="2" class="ribbonhead" style="color:#FFFFFF;" >
                                <h1 style="font-family:Arial, Helvetica, sans-serif;">
                                    <xsl:value-of select="VALUE" />
                                </h1>
                            </td>
                        </tr>
                    </xsl:for-each>
                    <!-- 2nd row -->
                    <tr>
                        <td width="70%" valign="top" align="left">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <xsl:for-each select="PANELBODY">
                                    <xsl:for-each select="FIELD">
                                        <xsl:choose>
                                            <!-- Main Text Box -->
                                            <xsl:when test="@type='TextBox' and ((@id='name') or (@id='age') or (@id='uhid'))">
                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                    <tr>
                                                        <xsl:apply-templates select = "@label" />                                                     
                                                        <td width="63%" align="left" valign="top">
                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                <xsl:if test="@name='value'">
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                    <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                        </td>
                                                    </tr>
                                                </xsl:if>
                                            </xsl:when>
                                            
                                            <!-- Main Text Area-->
                                            <xsl:when test="@type='TextArea' and (@id='address')">
                                                <xsl:if test="VALUE and VALUE!=''">
                                                    <tr>
                                                        <xsl:apply-templates select = "@label" />
                                                        <td width="63%" align="left" valign="top">
                                                            <xsl:call-template name="LFsToBRs">
                                                                <xsl:with-param name="input" select="VALUE"/>
                                                            </xsl:call-template> 
                                                        </td>
                                                    </tr>
                                                </xsl:if>
                                            </xsl:when>
                                            
                                            <!-- Main Radio Button -->                          
                                            <xsl:when test="@type='RadioButtonList' and ((@id='gender') or (@id='education') or (@id='occupation') or (@id='martial_status') or (@id='religion') or (@id='level_status')or (@id='place_of_living'))">
                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                    <tr>
                                                        <xsl:apply-templates select = "@label" />
                                                        <td width="63%" align="left" valign="top">
                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                <xsl:if test="@Selected = 'true'">
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                            <xsl:if test="FIELD">
                                                                <span>
                                                                    <xsl:attribute name="id">
                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:attribute name="class">
                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:for-each select="FIELD">
                                                                        <xsl:choose>
                                                                            <xsl:when test="@type='TextBox'">
                                                                                <!--                                                                                <br/>--> 
                                                                                <!--                                                                                <xsl:value-of select="@label" />&#160;-->
                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                    <xsl:if test="@name='value'"> |
                                                                                        <span id="sub_textbox"> 
                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                        </span>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:when>
                                                            
                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                <br/>
                                                                                <xsl:value-of select="@label" />&#160;
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                        <span id="sub_textbox">
                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                        </span>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:when>
                                                            
                                                                            <xsl:when test="@type='DropDownList'">
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                        <br/>
                                                                                        <xsl:value-of select="../../@label"/>  
                                                                                        <xsl:value-of select="@value"></xsl:value-of>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:when>
                                                                        </xsl:choose>
                                                                    </xsl:for-each>
                                                                </span>
                                                            </xsl:if>
                                                        </td>
                                                    </tr>
                                                </xsl:if>
                                            </xsl:when>
                                        </xsl:choose>
                                    </xsl:for-each>
                                </xsl:for-each>
                            </table>
                        </td>
                        <td width="30%" align="right" valign="top">
                            <xsl:for-each select="PANELBODY/FIELD[((@type='TextBox') or (@type='CheckBoxList')) and ((@id='TherapistName') or (@id='referral_details'))]">
                                <xsl:choose>
                                    <xsl:when test="@type='TextBox'">
                                        <table width="280" border="0" cellspacing="0" cellpadding="0" class="referl-details">
                                            <tr>
                                                <td width="100" align="left" valign="top">
                                                    <strong>
                                                        Recorded by <span class="colon"> : </span>
                                                    </strong> 
                                                </td>
                                                <td width="180" align="left" valign="top">
                                                    <span id="created_name"></span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="100" align="left" valign="top">
                                                    <strong>
                                                        Date <span class="colon"> : </span>
                                                    </strong>
                                                </td>
                                                <td width="180" align="left" valign="top">
                                                    <span id="created_date"></span>
                                                </td>
                                            </tr>
                                            
                                        </table>
                                        <table width="280" border="0" cellspacing="0" cellpadding="0" class="referl-details">
                                            <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                <tr>
                                                    <td width="100" align="left" valign="top">
                                                        <strong>
                                                            Consultant <span class="colon"> : </span>
                                                        </strong>
                                                    </td>
                                                    <td width="180" align="left" valign="top">
                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                            <xsl:if test="@name='value'">
                                                                <strong>
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                    <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                                                </strong> 
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span id='hide_span'>Hiding text</span>
                                                    </td>
                                                </tr>
                                            </xsl:if>
                                            <tr>
                                                <td width="100" align="left" valign="top">
                                                    <strong>
                                                        Date <span class="colon"> : </span>
                                                    </strong>
                                                </td>                                                
                                                <td width="180" align="left" valign="top">
                                                    <span id="date_name"></span> | <span id="time"></span> 
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span id='hide_span'>Hiding text</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </xsl:when>
                                    <xsl:when test="@type='CheckBoxList'">
                                        <table id="referral" width="280" border="0" cellspacing="0" cellpadding="0" class="referl-details">
                                            <tr>
                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                    <td width="100" align="left" valign="top">
                                                        <strong>
                                                            <xsl:value-of select="@label" /> 
                                                            <span class="colon"> : </span>
                                                        </strong>
                                                    </td>
                                                    <td width="180" align="left" valign="top">
                                                        <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                            <xsl:value-of select="concat(' ' , @value)" />
                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                        </xsl:for-each>
                                                        <xsl:if test="FIELD">
                                                            <span>
                                                                <xsl:attribute name="id">
                                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:attribute name="class">
                                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:for-each select="FIELD">
                                                                    <xsl:choose>
                                                                        <xsl:when test="@type='TextBox'">
                                                                            <!--                                                                            ,<xsl:value-of select="@label" />&#160;-->
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='value'">
                                                                                    <span id="sub_textbox">
                                                                                        | <xsl:value-of select="current()"></xsl:value-of>
                                                                                    </span>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:when>
                                                                    </xsl:choose>
                                                                </xsl:for-each>
                                                            </span>
                                                        </xsl:if>
                                                    </td>
                                                </xsl:if>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <span id='hide_span'>Hiding text</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </xsl:when>
                                </xsl:choose>
                            </xsl:for-each>
                        </td>
                    </tr>
                
                    <!-- 3rd row -->
                    <xsl:for-each select="PANELBODY/FIELD[@type='Header2' and @label='Informant']">
                        <tr>
                            <td colspan="2" align="left" valign="top" class="ribbon">
                                <h2 style="font-family:Arial, Helvetica, sans-serif;"> 
                                    <xsl:value-of select="@label" />
                                </h2>
                            </td>
                        </tr>
                    </xsl:for-each>
                
                    <!-- 4th row -->
                    <tr class="informant_body">
                        <td colspan="2">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <xsl:for-each select="PANELBODY/FIELD[(@id='relationship') or (@id='primary_care_giver')]">
                                        <xsl:choose>
                                            <!-- Main Checkbox -->
                                            <xsl:when test="@type='CheckBoxList'">
                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                    <td width="25%" align="left" valign="top" class="small-left-heading">
                                                        <xsl:value-of select="@label" /> 
                                                        <span class="colon"> : </span>
                                                    </td>
                                                    <td width="25%" align="left" valign="top">
                                                        <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                            <xsl:value-of select="concat(' ' , @value)" />
                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                        </xsl:for-each>
                                                        <xsl:if test="FIELD">
                                                            <span>
                                                                <xsl:attribute name="id">
                                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:attribute name="class">
                                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:for-each select="FIELD">
                                                                    <xsl:choose>
                                                                        <xsl:when test="@type='TextBox'">
                                                                            |
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='value'">
                                                                                    <span id="sub_textbox">
                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                    </span>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:when>
                                                                    </xsl:choose>
                                                                </xsl:for-each>
                                                            </span>
                                                        </xsl:if>
                                                    </td>
                                                </xsl:if>
                                            </xsl:when>
                                            
                                            <xsl:when test="@type='MultiDropDownList'">
                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                    <td width="25%" align="left" valign="top" class="small-left-heading">
                                                        <xsl:value-of select="@label" /> 
                                                        <span class="colon"> : </span>
                                                    </td>
                                                    <td width="25%" align="left" valign="top">
                                                        <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                            <xsl:value-of select="concat(' ' , @value)" />
                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                        </xsl:for-each>
                                                    </td>
                                                </xsl:if>
                                            </xsl:when>
                                        </xsl:choose>
                                    </xsl:for-each>

                                </tr>
                            
                                <tr>
                                    <xsl:for-each select="PANELBODY/FIELD[(@id='information') or (@id='information_adequacy')]">
                                        <xsl:choose>
                                            <xsl:when test="@type='RadioButtonList'">
                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                    <td width="25%" align="left" valign="top" class="small-left-heading">
                                                        <xsl:value-of select="@label" /> 
                                                        <span class="colon"> : </span>
                                                    </td>
                                                    <td width="25%" align="left" valign="top">
                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                            <xsl:if test="@Selected = 'true'">
                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                        <xsl:if test="FIELD">
                                                            <span>
                                                                <xsl:attribute name="id">
                                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:attribute name="class">
                                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:for-each select="FIELD">
                                                                    <xsl:choose>
                                                                        <xsl:when test="@type='RadioButtonList'">
                                                                            <br/>
                                                                            <xsl:value-of select="@label" />&#160;
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <span id="sub_textbox">
                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                    </span>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:when>
                                                                    </xsl:choose>
                                                                </xsl:for-each>
                                                            </span>
                                                        </xsl:if>
                                                    </td>
                                                </xsl:if>
                                            </xsl:when>
                                        </xsl:choose>
                                    </xsl:for-each>
                                </tr>
                            
                                <tr>
                                    <xsl:for-each select="PANELBODY/FIELD[@id='duration_of_relationship']">
                                        <xsl:choose>
                                            <!--Main Text Box With DropDownList-->
                                            <xsl:when test="@type='TextBoxDDL'">
                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                    <td width="27%" align="left" valign="top" class="small-left-heading">
                                                        <xsl:value-of select="@label" /> 
                                                        <span class="colon"> : </span>
                                                    </td>
                                                    <td width="23%" align="left" valign="top">
                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                            <xsl:if test="@name='value'">
                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                        <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                            <xsl:if test="@Selected = 'true'">&#160;
                                                                <xsl:value-of select="@value"></xsl:value-of>
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                    </td>
                                                    <td colspan="2" align="left" valign="top">
                                                        <span id='hide_span'>Hiding text</span>
                                                    </td>
                                                </xsl:if>
                                            </xsl:when>
                                        </xsl:choose>
                                    </xsl:for-each>
                                
                                </tr>
                           
                            
                            </table>
                        </td>
                    </tr>
                
                    <!-- 5th row -->
                    <xsl:for-each select="PANELBODY/FIELD[@type='TextArea' and @id='presenting_complaints']">
                        <xsl:if test="VALUE and VALUE!=''">
                            <tr>
                                <td colspan="2" align="left" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td align="left" valign="top" class="small-left-heading">
                                                <xsl:value-of select="@label" /> 
                                                <span class="colon"> : </span>
                                            </td>
                                            <td align="left" valign="middle">
                                                <xsl:call-template name="LFsToBRs">
                                                    <xsl:with-param name="input" select="VALUE"/>
                                                </xsl:call-template>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </xsl:if>
                    </xsl:for-each>
                   
                    
                    <!-- 6th row -->
                    <xsl:for-each select="PANELBODY/FIELD[@type='textareaFull' and @id='history_presenting_illness']">
                        <xsl:if test="VALUE and VALUE!=''">
                            <tr>
                                <td colspan="2" align="left" valign="top" class="small-left-heading">
                                    <xsl:value-of select="@label" /> 
                                </td>
                            </tr>
                            <tr>
                                <td id="history_presenting" colspan="2" align="left" valign="top">
                                    <xsl:attribute name="class">
                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                            <xsl:if test="@name='class'">
                                                <p>
                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                </p>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </xsl:attribute>
                                    <xsl:value-of select="VALUE" ></xsl:value-of>
                                </td>
                            </tr>
                        </xsl:if>
                    </xsl:for-each>
                    
                    <!-- 7th row -->
                    
                    <tr>
                        <td colspan="2" align="left" valign="top">
                            <table id='past_medical_history' width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                <xsl:for-each select="PANELBODY/FIELD[(@type='CheckBoxList') and ((@id='past_medical_diabetes') or (@id='past_medical_hypertension') or (@id='past_medical_cva')
or (@id='past_medical_TB') or (@id='past_medical_cancer') or (@id='past_medical_seizure') or (@id='past_medical_cad')  or (@id='past_medical_mental_illness'))]">
                                    <xsl:if test="position() = 1">
                                        <tr>
                                            <td colspan="2" align="left" valign="top" class="ribbon">
                                                <h2 style="font-family:Arial, Helvetica, sans-serif;"> 
                                                    Past Medical / Surgical History
                                                </h2>
                                            </td>
                                        </tr>
                                    </xsl:if>
                                    <xsl:choose>
                                        <xsl:when test="@type='CheckBoxList'">
                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                <tr>
                                                    <td colspan="2" width="100%" align="left" valign="top" class="small-left-heading list complaints">
                                                        <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                            <xsl:value-of select="concat(' ' , @value)" />
                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                        </xsl:for-each>
                                                        <xsl:if test="FIELD">
                                                            <span>
                                                                <xsl:attribute name="id">
                                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:attribute name="class">
                                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                </xsl:attribute>
                                                                <xsl:for-each select="FIELD">
                                                                    <xsl:choose>
                                                                        <xsl:when test="@type='TextBox'">
                                                                            <!--                                                                            ,<xsl:value-of select="@label" />&#160;-->
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='value'">
                                                                                    <span id="sub_textbox">
                                                                                        | <xsl:value-of select="current()"></xsl:value-of>
                                                                                    </span>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:when>
                                                                    </xsl:choose>
                                                                </xsl:for-each>
                                                            </span>
                                                        </xsl:if>
                                                    </td>
                                                </tr>
                                            </xsl:if>
                                        </xsl:when>
                                    </xsl:choose>
                                </xsl:for-each>
                            </table>
                        </td>
                    </tr>
                    
                    
                    <xsl:for-each select="PANELBODY/FIELD[@type='Header2' and @label='Current Medications']">
                        <tr>
                            <td colspan="2" align="left" valign="top" class="ribbon">
                                <h2 style="font-family:Arial, Helvetica, sans-serif;"> 
                                    <xsl:value-of select="@label" />
                                </h2>
                            </td>
                        </tr>
                    </xsl:for-each>
                    
                    <tr>
                        <td align="left" valign="top" class="table2 table4">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                <xsl:for-each select="PANELBODY/FIELD[@type='RadGrid' and @ADDButtonID='RGprevprescriptionadd']">
                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                        <xsl:attribute name="{@name}">
                                            <xsl:value-of select="current()"></xsl:value-of>
                                        </xsl:attribute>
                                    </xsl:for-each>
                                    <thead>
                                        <tr>
                                            <xsl:for-each select="HEADER/TH">
                                                <td width="14%" class="inner-table-heading">
                                                    <strong>
                                                        <xsl:value-of select="current()" />
                                                    </strong>
                                                </td>
                                            </xsl:for-each>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <xsl:for-each select="COLUMNS">
                                            <tr>
                                                <xsl:for-each select="FIELD">
                                                    <td class="">
                                                        <xsl:choose>
                                                            <xsl:when test="@type='TextBox'">
                                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:if>
                                                            </xsl:when>
                                                            
                                                            <xsl:when test="@type='label'">
                                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <xsl:value-of select="current()"/>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:if>
                                                                                    
                                                            </xsl:when>
                                                        </xsl:choose>
                                                    </td>
                                                </xsl:for-each>
                                            </tr>
                                    
                                        </xsl:for-each>
                                    </tbody>
                                </xsl:for-each>
                            </table>
                        </td>
                    </tr>
                    
                    <tr>
                        <td colspan="2" align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <xsl:for-each select="PANELBODY/FIELD[(@type='CheckBoxList') and (@id='family_histroy')]">
                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                        <tr>
                                            <td width="40%" align="left" valign="top" class="small-left-heading">
                                                <xsl:value-of select="@label" />
                                                <span class="colon"> : </span>
                                            </td>
                                            <td width="60%" align="left" valign="top">
                                                <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                    <xsl:value-of select="concat(' ' , @value)" />
                                                    <xsl:if test="not(position() = last())">,</xsl:if>
                                                </xsl:for-each>
                                                <xsl:if test="FIELD">
                                                    <span>
                                                        <xsl:attribute name="id">
                                                            <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                        </xsl:attribute>
                                                        <xsl:attribute name="class">
                                                            <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                        </xsl:attribute>
                                                        <xsl:for-each select="FIELD">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='TextBox'">
                                                                    <!--                                                                            ,<xsl:value-of select="@label" />&#160;-->
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <span id="sub_textbox">
                                                                                | <xsl:value-of select="current()"></xsl:value-of>
                                                                            </span>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </span>
                                                </xsl:if>
                                            </td>
                                        </tr>
                                    </xsl:if>
                                </xsl:for-each>
                            </table>
                        </td>
                    </tr>
                    
                    <xsl:for-each select="PANELBODY/FIELD[@type='Header2' and @label='Personal History']">
                        <tr>
                            <td colspan="2" align="left" valign="top" class="ribbon">
                                <h2 style="font-family:Arial, Helvetica, sans-serif;"> 
                                    <xsl:value-of select="@label" />
                                </h2>
                            </td>
                        </tr>
                    </xsl:for-each>
                    
                    <tr class="personal_history">
                        <td colspan="2" align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <xsl:for-each select="PANELBODY/FIELD[(@type='CheckBoxList') and ((@id='habit') or (@id='drug_dependence'))]">
                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                        <tr>
                                            <td width="40%" align="left" valign="top" class="small-left-heading">
                                                <xsl:value-of select="@label" />
                                                <span class="colon"> : </span>
                                            </td>
                                            <td width="60%" align="left" valign="top">
                                                <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                    <xsl:value-of select="concat(' ' , @value)" />
                                                    <xsl:if test="not(position() = last())">,</xsl:if>
                                                </xsl:for-each>
                                                <xsl:if test="FIELD">
                                                    <span>
                                                        <xsl:attribute name="id">
                                                            <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                        </xsl:attribute>
                                                        <xsl:attribute name="class">
                                                            <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                        </xsl:attribute>
                                                        <xsl:for-each select="FIELD">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='TextBox'">
                                                                    <!--                                                                            ,<xsl:value-of select="@label" />&#160;-->
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <span id="sub_textbox">
                                                                                | <xsl:value-of select="current()"></xsl:value-of>
                                                                            </span>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </span>
                                                </xsl:if>
                                            </td>
                                        </tr>
                                    </xsl:if>
                                </xsl:for-each>
                            </table>
                        </td>
                    </tr>
                    
                    <xsl:for-each select="PANELBODY/FIELD[@type='Header2' and @label='Physical Examination']">
                        <tr>
                            <td colspan="2" align="left" valign="top" class="ribbon">
                                <h2 style="font-family:Arial, Helvetica, sans-serif;"> 
                                    <xsl:value-of select="@label" />
                                </h2>
                            </td>
                        </tr>
                    </xsl:for-each>
                    
                    
                    <tr>
                        <td align="left" valign="top" class="table2 table4">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" class="print-friendly">
                                <xsl:for-each select="PANELBODY/FIELD[@type='RadGrid' and @ADDButtonID='RGvitaladd']">
                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                        <xsl:attribute name="{@name}">
                                            <xsl:value-of select="current()"></xsl:value-of>
                                        </xsl:attribute>
                                    </xsl:for-each>
                                    <thead>
                                        <tr>
                                            <xsl:for-each select="HEADER/TH">
                                                <td width="14%" class="inner-table-heading">
                                                    <strong>
                                                        <xsl:value-of select="current()" />
                                                    </strong>
                                                </td>
                                            </xsl:for-each>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <xsl:for-each select="COLUMNS">
                                            <tr>
                                                <xsl:for-each select="FIELD">
                                                    <td class="">
                                                        <xsl:choose>
                                                            <xsl:when test="@type='TextBox'">
                                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <span class='Text_box'>
                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                            </span>
                                                                            
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:if>
                                                            </xsl:when>
                                                            
                                                            <xsl:when test="@type='label'">
                                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <xsl:value-of select="current()"/>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:if>
                                                                                    
                                                            </xsl:when>
                                                        </xsl:choose>
                                                    </td>
                                                </xsl:for-each>
                                            </tr>
                                    
                                        </xsl:for-each>
                                    </tbody>
                                </xsl:for-each>
                            </table>
                        </td>
                    </tr>
                    <tr class="physical_examination">
                        <td colspan="2" align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <xsl:for-each select="PANELBODY/FIELD[(@type='TextBox') and ((@id='bpsystolic') or (@id='bpdiastolic')  or (@id='pulse')
                                     or (@id='temperature')  or (@id='sp02')  or (@id='height')  or (@id='weight')  or (@id='pain_score'))]">
                                    <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                        <tr>
                                            <xsl:apply-templates select = "@label" />                                                     
                                            <td width="63%" align="left" valign="top">
                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                    <xsl:if test="@name='value'">
                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                        <xsl:value-of select="../../@Backtext"></xsl:value-of>
                                                    </xsl:if>
                                                </xsl:for-each>
                                            </td>
                                        </tr>
                                    </xsl:if>
                                </xsl:for-each>
                            </table>
                        </td>
                    </tr>
                    
                    <tr>
                        <td colspan="2" align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <xsl:for-each select="PANELBODY/FIELD[(@type='TextArea') and (@id='investigations')]">
                                    <xsl:if test="VALUE and VALUE!=''">
                                        <tr>
                                            <xsl:apply-templates select = "@label" />
                                            <td width="63%" align="left" valign="top">
                                                <xsl:call-template name="LFsToBRs">
                                                    <xsl:with-param name="input" select="VALUE"/>
                                                </xsl:call-template> 
                                            </td>
                                        </tr>
                                    </xsl:if>
                                </xsl:for-each>
                            </table>
                        </td>
                    </tr>
                    
                    <tr>
                        <td align="left" valign="top" class="table2 table4">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <xsl:for-each select="PANELBODY/FIELD[@type='RadGrid' and @ADDButtonID='TBicdcodeadd']">
                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                        <xsl:attribute name="{@name}">
                                            <xsl:value-of select="current()"></xsl:value-of>
                                        </xsl:attribute>
                                    </xsl:for-each>
                                    <thead>
                                        <tr>
                                            <xsl:for-each select="HEADER/TH">
                                                <td class="inner-table-heading">
                                                    <strong>
                                                        <xsl:value-of select="current()" />
                                                    </strong>
                                                </td>
                                            </xsl:for-each>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <xsl:for-each select="COLUMNS">
                                            <tr>
                                                <xsl:for-each select="FIELD">
                                                    <td class="">
                                                        <xsl:choose>
                                                            <xsl:when test="@type='TextBox'">
                                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:if>
                                                            </xsl:when>
                                                        </xsl:choose>
                                                    </td>
                                                </xsl:for-each>
                                            </tr>
                                    
                                        </xsl:for-each>
                                    </tbody>
                                </xsl:for-each>
                            </table>
                        </td>
                    </tr>
                    
                    <tr>
                        <td colspan="2" align="left" valign="top">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <xsl:for-each select="PANELBODY/FIELD[(@type='TextArea') and (@id='follow_up_plan')]">
                                    <xsl:if test="VALUE and VALUE!=''">
                                        <tr>
                                            <xsl:apply-templates select = "@label" />
                                            <td width="63%" align="left" valign="top">
                                                <xsl:call-template name="LFsToBRs">
                                                    <xsl:with-param name="input" select="VALUE"/>
                                                </xsl:call-template> 
                                            </td>
                                        </tr>
                                    </xsl:if>
                                </xsl:for-each>
                            </table>
                        </td>
                    </tr>
                    
                    
 
                </tbody>
            </table>
        </xsl:for-each>
    </xsl:template>

    <!--Used all label-->
    <xsl:template match = "@label">
        <td width="37%" align="left" valign="top" class="small-left-heading">
            <xsl:value-of select="." /> 
            <span class="colon"> : </span>
        </td>
    </xsl:template>
    
    <xsl:template name="LFsToBRs">
        <xsl:param name="input" />
        <xsl:choose>
            <xsl:when test="contains($input, '&#10;')">
                <xsl:value-of select="substring-before($input, '&#10;')" />
                <br />
                <xsl:call-template name="LFsToBRs">
                    <xsl:with-param name="input" select="substring-after($input, '&#10;')" />
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$input" />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>