<?php

namespace common\models;

use yii\db\ActiveRecord;

/**
 * This is the model class for table "gl_patient_share_resources".
 *
 * @property integer $share_id
 * @property integer $org_id
 * @property integer $tenant_id
 * @property string $patient_global_guid
 * @property string $resource
 */
class GlPatientShareResources extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'gl_patient_share_resources';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['org_id', 'tenant_id', 'patient_global_guid', 'resource'], 'required'],
            [['org_id', 'tenant_id'], 'integer'],
            [['resource'], 'string'],
            [['patient_global_guid'], 'string', 'max' => 50]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'share_id' => 'Share ID',
            'org_id' => 'Org ID',
            'tenant_id' => 'Tenant ID',
            'patient_global_guid' => 'Patient Global Guid',
            'resource' => 'Resource',
        ];
    }
    
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }
    
    public function getOrg() {
        return $this->hasOne(CoOrganization::className(), ['org_id' => 'org_id']);
    }
}
